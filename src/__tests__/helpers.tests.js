const {
  getArrayOfImages,
  getIdsFromClass,
  getSlugsFromSrc,
} = require('../helpers');

const himalayaTree = require('./himalayaTree.json');
const himalayaTreeNoImages = require('./himalayaTreeNoImages.json');
const imagesWithClass = require('./imagesWithClass.json');
const imagesWithDataSrc = require('./imagesWithDataSrc.json');
const imagesWithSrc = require('./imagesWithSrc.json');
const imagesWithDataOriginal = require('./imagesWithDataOriginal.json');
const imagesWithSrcSizes = require('./imagesWithSrcSizes.json');

describe('Helper getArrayOfImages', () => {
  test('Should return an empty array if no images are provided', () => {
    const imageElements = getArrayOfImages(himalayaTreeNoImages);
    expect(imageElements).toHaveLength(0);
    expect(imageElements).toMatchSnapshot();
  });
  test('Should return a flat array of images', () => {
    const imageElements = getArrayOfImages(himalayaTree);
    expect(imageElements).toHaveLength(5);
    expect(imageElements[0].attributes[0].value).toBe(
      'alignnone size-full wp-image-11857',
    );
    expect(imageElements[1].attributes[0].value).toBe(
      'alignnone size-full wp-image-11858',
    );
    expect(imageElements[2].attributes[0].value).toBe(
      'alignnone size-full wp-image-11861',
    );
    expect(imageElements[3].attributes[0].value).toBe(
      'alignnone size-full wp-image-11859',
    );
    expect(imageElements[4].attributes[0].value).toBe(
      'alignnone size-full wp-image-11860',
    );
    expect(imageElements).toMatchSnapshot();
  });
});

describe('Helper getIdsFromClass', () => {
  test('Should return an empty array if no ids are extracted from class', () => {
    const ids = getIdsFromClass(imagesWithDataSrc);
    expect(ids).toHaveLength(0);
    expect(ids).toMatchSnapshot();
  });
  test('Should return an array of ids', () => {
    const ids = getIdsFromClass(imagesWithClass);
    expect(ids).toHaveLength(5);
    expect(ids).toMatchSnapshot();
  });
});

describe('Helper getSlugsFromSrc', () => {
  test('Should return an empty array if no slugs are extracted', () => {
    const slugs = getSlugsFromSrc(imagesWithClass);
    expect(slugs).toHaveLength(0);
    expect(slugs).toMatchSnapshot();
  });
  test('Should return an array of slugs extracted from data-src', () => {
    const slugs = getSlugsFromSrc(imagesWithDataSrc);
    expect(slugs).toHaveLength(5);
    expect(slugs).toMatchSnapshot();
  });
  test('Should return an array of slugs extracted from src', () => {
    const slugs = getSlugsFromSrc(imagesWithSrc);
    expect(slugs).toHaveLength(5);
    expect(slugs).toMatchSnapshot();
  });
  test('Should return an array of slugs extracted from data-original', () => {
    const slugs = getSlugsFromSrc(imagesWithDataOriginal);
    expect(slugs).toHaveLength(5);
    expect(slugs).toMatchSnapshot();
  });
  test('Should return the right slugs if the filename has a size', () => {
    const slugs = getSlugsFromSrc(imagesWithSrcSizes);
    expect(slugs).toHaveLength(5);
    expect(slugs[0]).toBe('image_11857');
    expect(slugs[1]).toBe('image_11858x');
    expect(slugs[2]).toBe('image_11861-');
    expect(slugs[3]).toBe('image_11859_');
    expect(slugs[4]).toBe('image_11860---');
    expect(slugs).toMatchSnapshot();
  });
});
