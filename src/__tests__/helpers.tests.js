const { getIdFromClass, getSlugFromSrc } = require('../helpers');

const imagesWithClass = require('./data/imagesWithClass.json');
const imagesWithClassButNoId = require('./data/imagesWithClassButNoId.json');
const imagesWithDataSrc = require('./data/imagesWithDataSrc.json');
const imagesWithSrc = require('./data/imagesWithSrc.json');
const imagesWithDataOriginal = require('./data/imagesWithDataOriginal.json');
const imagesWithSrcSizes = require('./data/imagesWithSrcSizes.json');

describe('Helper getIdFromClass', () => {
  test('Should return `null` if no id are extracted from class', () => {
    imagesWithDataSrc.forEach(image => {
      const id = getIdFromClass(image);
      expect(id).toBe(null);
    });

    imagesWithClassButNoId.forEach(image => {
      const id = getIdFromClass(image);
      expect(id).toBe(null);
    });
  });
  test('Should return an id', () => {
    imagesWithClass.forEach(image => {
      const id = getIdFromClass(image);
      expect(typeof id).toBe('number');
    });
  });
});

describe('Helper getSlugFromSrc', () => {
  test('Should return `null` if no slug are extracted', () => {
    imagesWithClass.forEach(image => {
      const slug = getSlugFromSrc(image);
      expect(slug).toBe(null);
    });
  });
  test('Should return a slug extracted from data-src', () => {
    imagesWithDataSrc.forEach(image => {
      const slug = getSlugFromSrc(image);
      expect(typeof slug).toBe('string');
    });
  });
  test('Should return a slug extracted from src', () => {
    imagesWithSrc.forEach(image => {
      const slug = getSlugFromSrc(image);
      expect(typeof slug).toBe('string');
    });
  });
  test('Should return a slug extracted from data-original', () => {
    imagesWithDataOriginal.forEach(image => {
      const slug = getSlugFromSrc(image);
      expect(typeof slug).toBe('string');
    });
  });
  test('Should return the right slug if the filename has a size', () => {
    const slugs = [
      'image_11857',
      'image_11858x',
      'image_11861-',
      'image_11859_',
      'image_11860---',
    ];

    imagesWithSrcSizes.forEach((image, index) => {
      const slug = getSlugFromSrc(image);
      expect(typeof slug).toBe('string');
      expect(slug).toBe(slugs[index]);
    });
  });
});
