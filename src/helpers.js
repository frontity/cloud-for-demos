// Get an array of image elements from himalaya tree.
const getArrayOfImages = elements =>
  elements.reduce((final, current) => {
    if (current.tagName === 'img') return final.concat(current);
    if (current.children && current.children.length)
      return final.concat(getArrayOfImages(current.children));
    return final;
  }, []);

// Get the media ids from class attribute.
const getIdsFromClass = elements =>
  elements.reduce((final, { attributes }) => {
    const className = attributes.find(attribute => attribute.key === 'class');
    const idRegexp = /wp-image-(\d+)/;
    const matches = className ? className.value.match(idRegexp) : null;
    const id = matches ? matches[1] : null;

    if (id) final.push(parseInt(id, 10));

    return final;
  }, []);

// Get the media slugs from data-src, src or data-original attributes.
const getSlugsFromSrc = elements =>
  elements.reduce((final, { attributes }) => {
    const attrs = attributes.reduce(
      (result, current) => ({ ...result, [current.key]: current.value }),
      {},
    );
    const src =
      attrs['data-src'] || attrs.src || attrs['data-original'] || null;

    if (src) {
      const filenameRegexp = /([^/\\&?]+)\.\w{2,4}(?=([?&].*$|$))/;
      const matches = src ? src.match(filenameRegexp) : null;
      const slug = matches
        ? src.match(filenameRegexp)[1].replace(/-\d+x\d+$/, '')
        : null;
      if (slug) final.push(slug);
    }

    return final;
  }, []);

module.exports = {
  getArrayOfImages,
  getIdsFromClass,
  getSlugsFromSrc,
};
