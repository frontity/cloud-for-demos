const { parse } = require('url');
const got = require('got');
const cors = require('micro-cors')();
const { createError } = require('micro');
const himalaya = require('himalaya');
const {
  getArrayOfImages,
  getIdsFromClass,
  getSlugsFromSrc,
} = require('./helpers');

module.exports = cors(async req => {
  try {
    const initialUrl = req.url.replace('/', '');
    const { protocol, hostname } = parse(initialUrl);
    if (!protocol || !hostname) throw new Error(`Invalid url: ${initialUrl}`);

    // Function to request data from provided url (Rest API).
    const getData = url =>
      got.get(url, {
        headers: {
          'user-agent': req.headers['user-agent'],
          host: url.host,
        },
        json: true,
      });

    // Modifies the data before sending it through.
    const changeData = async data => {
      const imageElements = getArrayOfImages(
        himalaya.parse(data.content.rendered),
      );
      const imageIds = getIdsFromClass(imageElements);

      if (imageIds.length) {
        const { body } = await getData(
          `${protocol}//${hostname}/?rest_route=/wp/v2/media&include=${imageIds.join(
            ',',
          )}`,
        );

        data.content_media = imageIds; // eslint-disable-line
        data._embedded['wp:contentmedia'] = [body]; // eslint-disable-line
        return data;
      }

      const slugs = getSlugsFromSrc(imageElements);

      if (slugs.length) {
        const media = (await Promise.all(
          slugs.map(async slug => {
            const { body } = await getData(
              `${protocol}//${hostname}/?rest_route=/wp/v2/media&slug=${slug}`,
            );

            if (body.length) return body[0];

            return null;
          }),
        )).filter(item => item);

        data.content_media = media.map(entity => entity.id); // eslint-disable-line
        data._embedded['wp:contentmedia'] = [media]; // eslint-disable-line
        return data;
      }

      return data;
    };

    // Get data from original call.
    const { body } = await getData(initialUrl);

    // Get images if data is a list of entities.
    if (Array.isArray(body))
      return await Promise.all(
        body.map(async item => {
          // Return initial entity if has no content.
          if (typeof item.content === 'undefined') return item;

          return changeData(item);
        }),
      );

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
