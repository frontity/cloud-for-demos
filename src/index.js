/* eslint-disable no-param-reassign, no-underscore-dangle */

const { parse } = require('url');
const got = require('got');
const cors = require('micro-cors')();
const { createError } = require('micro');
const himalaya = require('himalaya');
const { getIdFromClass, getSlugFromSrc } = require('./helpers');

module.exports = cors(async req => {
  try {
    const initialUrl = req.url.replace('/', '');
    const { protocol, hostname, search } = parse(initialUrl);
    if (!protocol || !hostname) throw new Error(`Invalid url: ${initialUrl}`);

    // Function to request data from Rest API.
    const getData = async query =>
      (await got.get(`${protocol}//${hostname}/${query}`, {
        headers: {
          'user-agent': req.headers['user-agent'],
          host: hostname,
        },
        json: true,
      })).body;

    // Modifies the data before sending it through.
    const changeData = async data => {
      const contentMedia = [];
      const contentMediaIds = [];

      // const content = himalaya.parse(data.content.rendered);

      const getContent = content =>
        Promise.all(
          content.map(async element => {
            if (element.tagName === 'img') {
              const id = getIdFromClass(element);

              if (id) {
                const body = await getData(`?rest_route=/wp/v2/media/${id}`);

                if (!body.id) return element;

                contentMediaIds.push(id);
                contentMedia.push(body);
                element.attributes.push({
                  key: 'data-attachment-id',
                  value: id,
                });

                return element;
              }

              const slug = getSlugFromSrc(element);

              if (slug) {
                const body = await getData(
                  `?rest_route=/wp/v2/media&slug=${slug}`,
                );

                if (!body.length) return element;
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
    const body = await getData(search);

    // Get images if data is a list of entities.
    if (Array.isArray(body)) {
      return await Promise.all(
        body.map(async item => {
          // Return initial entity if has no content.
          if (typeof item.content === 'undefined') return item;

          return changeData(item);
        }),
      );
    }

    // Get images if data is an entity.
    if (typeof body.content !== 'undefined') {
      return await changeData(body);
    }

    // Return data if an entity has no content.
    return body;
  } catch (error) {
    throw createError(error.statusCode || 500, error.statusMessage || error);
  }
});
