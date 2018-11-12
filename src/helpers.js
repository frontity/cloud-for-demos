// Get the media ids from class attribute.
const getIdFromClass = ({ attributes }) => {
  const className = attributes.find(attribute => attribute.key === 'class');
  const idRegexp = /wp-image-(\d+)/;
  const matches = className ? className.value.match(idRegexp) : null;
  const id = matches ? matches[1] : null;

  return id && parseInt(id, 10);
};

// Get the media slugs from data-src, src or data-original attributes.
const getSlugFromSrc = ({ attributes }) => {
  const attrs = attributes.reduce(
    (result, current) => ({ ...result, [current.key]: current.value }),
    {},
  );
  const src = attrs['data-src'] || attrs.src || attrs['data-original'] || null;

  if (!src) return null;

  const filenameRegexp = /([^/\\&?]+)\.\w{2,4}(?=([?&].*$|$))/;
  const matches = src ? src.match(filenameRegexp) : null;
  const slug = matches
    ? src.match(filenameRegexp)[1].replace(/-\d+x\d+$/, '')
    : null;

  return slug;
};

module.exports = {
  getIdFromClass,
  getSlugFromSrc,
};
