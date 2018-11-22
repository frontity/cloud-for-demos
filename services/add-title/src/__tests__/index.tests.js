const nock = require('nock');
const micro = require('micro');
const axios = require('axios');
const listen = require('test-listen');
const server = require('../');
const categoryWithoutTitle = require('./data/categoryWithoutTitle.json');
const postWithTitleString = require('./data/postWithTitleString.json');
const postWithTitleRendered = require('./data/postWithTitleRendered.json');
const postWithTitleText = require('./data/postWithTitleText.json');
const listOfPostsWithTitleString = require('./data/listOfPostsWithTitleString.json');

axios.defaults.adapter = require('axios/lib/adapters/http');

let service;
let url;

beforeEach(async () => {
  service = await micro(server);
  url = await listen(service);
});

afterEach(() => {
  service.close();
});

describe('Server', () => {
  test('Should throw an error if no url is passed', async () => {
    await expect(axios(`${url}/`)).rejects.toThrow();
  });
  test('Should throw an error if an invalid url is passed', async () => {
    await expect(axios(`${url}/an-invalid-url`)).rejects.toThrow();
  });
  test('Receives a category without title and should return the original data', async () => {
    nock('https://frontity.com')
      .get('/?rest_route=/wp/v2/posts/1111125&_embed=true')
      .reply(200, categoryWithoutTitle);

    const { data } = await axios(
      `${url}/https://frontity.com/?rest_route=/wp/v2/posts/1111125&_embed=true`,
    );

    expect(data.title).toBeUndefined();
    expect(data).toMatchSnapshot();
  });
  test('Receives a post with `title` as a string and should return a post with `title.rendered` and `title.text`', async () => {
    nock('https://frontity.io')
      .get('/?rest_route=/wp/v2/posts/1111125&_embed=true')
      .reply(200, postWithTitleString);

    const title =
      'Revelados detalles y posible fecha de presentaci\u00f3n del smartphone plegable de Huawei';
    const { data } = await axios(
      `${url}/https://frontity.io/?rest_route=/wp/v2/posts/1111125&_embed=true`,
    );

    expect(data.title.rendered).toBe(title);
    expect(data.title.text).toBe(title);
    expect(data).toMatchSnapshot();
  });
  test('Receives a post with `title.rendered` and should return a post with `title.rendered` and `title.text`', async () => {
    nock('https://frontity.io')
      .get('/?rest_route=/wp/v2/posts/1111125&_embed=true')
      .reply(200, postWithTitleRendered);

    const { data } = await axios(
      `${url}/https://frontity.io/?rest_route=/wp/v2/posts/1111125&_embed=true`,
    );

    expect(data.title.rendered).toBe(
      '<h1>Revelados detalles y posible fecha de presentaci\u00f3n del smartphone plegable de Huawei</h1>',
    );
    expect(data.title.text).toBe(
      'Revelados detalles y posible fecha de presentaci\u00f3n del smartphone plegable de Huawei',
    );
    expect(data).toMatchSnapshot();
  });
  test('Receives a post with `title.text` and should return a post with `title.rendered` and `title.text`', async () => {
    nock('https://frontity.io')
      .get('/?rest_route=/wp/v2/posts/1111125&_embed=true')
      .reply(200, postWithTitleText);

    const title =
      'Revelados detalles y posible fecha de presentaci\u00f3n del smartphone plegable de Huawei';
    const { data } = await axios(
      `${url}/https://frontity.io/?rest_route=/wp/v2/posts/1111125&_embed=true`,
    );

    expect(data.title.rendered).toBe(title);
    expect(data.title.text).toBe(title);
    expect(data).toMatchSnapshot();
  });
  test('Receives a list of posts with `title` as a string and should return a list of posts with `title.rendered` and `title.text`', async () => {
    nock('https://frontity.io')
      .get('/?rest_route=/wp/v2/posts/&_embed=true&perPage=3')
      .reply(200, listOfPostsWithTitleString);

    const titles = [
      'Del deseo a la realidad: la edici\u00f3n gen\u00e9tica (a\u00fan) no est\u00e1 preparada para tratar a pacientes',
      'Ya puedes ampliar tu sistema de audio en casa con tus Chromecast',
      'Revelados detalles y posible fecha de presentaci\u00f3n del smartphone plegable de Huawei',
    ];
    const { data } = await axios(
      `${url}/https://frontity.io/?rest_route=/wp/v2/posts/&_embed=true&perPage=3`,
    );

    expect(data[0].title.rendered).toBe(titles[0]);
    expect(data[0].title.text).toBe(titles[0]);
    expect(data[1].title.rendered).toBe(titles[1]);
    expect(data[1].title.text).toBe(titles[1]);
    expect(data[2].title.rendered).toBe(titles[2]);
    expect(data[2].title.text).toBe(titles[2]);
    expect(data).toMatchSnapshot();
  });
});
