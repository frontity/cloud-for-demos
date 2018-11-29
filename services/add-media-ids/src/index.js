/* eslint-disable no-param-reassign, no-underscore-dangle */
const { parse } = require('url');
const { send, createError, sendError } = require('micro');
const axios = require('axios');
const cors = require('micro-cors')();
const himalaya = require('himalaya');
const { getIdFromClass, getSlugFromSrc } = require('./helpers');

module.exports = cors(async (req, res) => {
  try {
    const [initialUrl] = req.url.replace('/', '').match(/http.+$/) || [''];
    const { protocol, hostname, search } = parse(initialUrl);
    if (!protocol || !hostname) throw new Error(`Invalid url: ${initialUrl}`);

    // Function to request data from Rest API.
    const request = query =>
      axios({
        method: 'get',
        url: `${protocol}//${hostname}/${query || ''}`,
        headers: {
          'user-agent': req.headers['user-agent'],
          host: hostname,
        },
        responseType: 'json',
      });

    // Modifies the data before sending it through.
    const changeData = async data => {
      const contentMedia = [];
      const contentMediaIds = [];

      const getContent = content =>
        Promise.all(
          content.map(async element => {
            if (element.tagName === 'img') {
              const id = getIdFromClass(element);

              if (id) {
                let response;

                try {
                  response = await request(`?rest_route=/wp/v2/media/${id}`);
                } catch (e) {
                  return element;
                }

                const { data: body } = response;
                if (body.id) {
                  contentMediaIds.push(id);
                  contentMedia.push(body);
                  element.attributes.push({
                    key: 'data-attachment-id',
                    value: id.toString(),
                  });
                }

                return element;
              }

              const slug = getSlugFromSrc(element);

              if (slug) {
                let response;

                try {
                  response = await request(
                    `?rest_route=/wp/v2/media&slug=${slug}`,
                  );
                } catch (e) {
                  return element;
                }

                const { data: body } = response;
                if (body.length) {
                  contentMediaIds.push(body[0].id);
                  contentMedia.push(body[0]);
                  element.attributes.push({
                    key: 'data-attachment-id',
                    value: body[0].id.toString(),
                  });
                }

                return element;
              }
            }

            if (element.children && element.children.length) {
              element.children = await getContent(element.children);
            }

            return element;
          }),
        );

      const himalayaContent = himalaya.parse(data.content.rendered);
      const content = await getContent(himalayaContent);
      const stringContent = himalaya.stringify(content);

      data.content.rendered = stringContent;
      data.content_media = contentMediaIds;
      data._embedded['wp:contentmedia'] = [contentMedia];

      return data;
    };

    // Get data from original call.
    const { data: body, headers } = await request(search);

    // Preserve x-wp headers
    Object.entries(headers)
      .filter(([key]) => /x-wp/i.test(key))
      .forEach(([key, value]) => res.setHeader(key, value));

    // Get images if data is a list of entities.
    if (Array.isArray(body)) {
      const data = await Promise.all(
        body.map(async item => {
          // Return initial entity if has no content.
          if (typeof item.content === 'undefined') return item;

          return changeData(item);
        }),
      );

      return send(res, 200, data);
    }

    // Get images if data is an entity.
    if (typeof body.content !== 'undefined') {
      const data = await changeData(body);

      return send(res, 200, data);
    }

    // Return data if an entity has no content.
    return send(res, 200, body);
  } catch (error) {
    return sendError(
      req,
      res,
      createError(error.statusCode || 500, error.statusMessage || error),
    );
  }
});
