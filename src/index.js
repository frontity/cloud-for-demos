const { parse } = require('url');
const got = require('got');
const cors = require('micro-cors')();
const { createError } = require('micro');
const himalaya = require('himalaya');

const getArrayOfImages = elements => {
  return elements.reduce((final, current) => {
    if (current.tagName === 'img') return final.concat(current);
    if (current.children && current.children.length)
      return final.concat(getArrayOfImages(current.children));
    return final;
  }, []);
};

const getIdFromClass = (final, { attributes }) => {
  const className = attributes.find(attribute => attribute.key === 'class');
  const idRegexp = /wp-image-(\d+)/;
  const id = className ? className.value.match(idRegexp)[1] : undefined;

  if (typeof id !== 'undefined') final.push(id);

  return final;
};

const getSlugFromSrc = (final, { attributes }) => {
  const attrs = attributes.reduce((final, current) => {
    final[current.key] = current.value;
    return final;
  }, {});
  const src = attrs['data-src'] || attrs.src || attrs['data-original'] || undefined;
  const slugRegexp = /([^/\\&\?]+)\.\w{2,4}(?=([\?&].*$|$))/;

  if (typeof src !== 'undefined') {
    const slug = src.match(slugRegexp)[1];
    final.push(slug);
  }

  return final;
};

module.exports = cors(async req => {
  try {
    const url = req.url.replace('/', '');
    const { protocol, hostname } = parse(url);
    if (!protocol || !hostname) throw new Error(`Invalid url: ${url}`);

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
      const imageElements = getArrayOfImages(himalaya.parse(data.content.rendered));
      const imageIds = [];

      if (imageIds.length) {
        const { body: media } = await getData(
          `${protocol}//${hostname}/?rest_route=/wp/v2/media&include=${imageIds.join(',')}`,
        );

        data.content_media = imageIds;
        data._embedded['wp:contentmedia'] = media;
      } else {
        const slugs = imageElements.reduce(getSlugFromSrc, []);

        if (slugs.length) {
          const media = (await Promise.all(
            slugs.map(async slug => {
              const { body: media } = await getData(
                `${protocol}//${hostname}/?rest_route=/wp/v2/media&slug=${slug}`,
              );

              if (media.length) return media[0];

              return null;
            }),
          )).filter(item => item);

          const imageIds = media.map(media => media.id);

          data.content_media = imageIds;
          data._embedded['wp:contentmedia'] = media;
        }
      }

      return data;
    };

    // Get data from original call.
    const { body } = await getData(url);

    // Get images if data is a list of entities.
    if (Array.isArray(body))
      return await Promise.all(
        body.map(async item => {
          // Return initial entity if has no content.
          if (typeof item.content === 'undefined') return item;

          return await changeData(item);
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
