/* eslint-disable no-underscore-dangle */
const nock = require('nock');
const micro = require('micro');
const axios = require('axios');
const listen = require('test-listen');
const server = require('../');
const listOfPosts = require('./data/list_of_posts.json');
const post10452 = require('./data/post_10452.json');
const post10452noClass = require('./data/post_10452_no_class.json');
const media11857 = require('./data/media_11857.json');
const media11848 = require('./data/media_11848.json');
const media11822 = require('./data/media_11822.json');

// Makes axios to work properly with nock.
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
  test('Should return a post populated with content media', async () => {
    nock('https://frontity.com')
      .get('/?rest_route=/wp/v2/posts/10452&_embed=true')
      .reply(200, post10452)
      .get('/?rest_route=/wp/v2/media/11857')
      .reply(200, media11857);

    const body = (await axios(
      `${url}/https://frontity.com/?rest_route=/wp/v2/posts/10452&_embed=true`,
    )).data;

    expect(body.content_media).toEqual([11857]);
    expect(body.content.rendered).toMatch("data-attachment-id='11857'");
    expect(body._embedded['wp:contentmedia'][0][0]).toEqual(media11857);
    expect(body).toMatchSnapshot();
  });
  test("Should return a post populated with content media when images don't have class attribute", async () => {
    nock('https://frontity.com')
      .get('/?rest_route=/wp/v2/posts/10452&_embed=true')
      .reply(200, post10452noClass)
      .get('/?rest_route=/wp/v2/media&slug=stop_to_get_started-')
      .reply(200, [media11857]);

    const body = (await axios(
      `${url}/https://frontity.com/?rest_route=/wp/v2/posts/10452&_embed=true`,
    )).data;

    expect(body.content_media).toEqual([11857]);
    expect(body.content.rendered).toMatch("data-attachment-id='11857'");
    expect(body._embedded['wp:contentmedia'][0][0]).toEqual(media11857);
    expect(body).toMatchSnapshot();
  });
  test('Should return a list of posts populated with content media', async () => {
    nock('https://frontity.com')
      .get('/?rest_route=/wp/v2/posts&_embed=true')
      .reply(200, listOfPosts)
      .get('/?rest_route=/wp/v2/media/11857')
      .reply(200, media11857)
      .get('/?rest_route=/wp/v2/media/11848')
      .reply(200, media11848)
      .get('/?rest_route=/wp/v2/media/11822')
      .reply(200, media11822);

    const body = (await axios(
      `${url}/https://frontity.com/?rest_route=/wp/v2/posts&_embed=true`,
    )).data;

    expect(body[0].content_media).toEqual([11857]);
    expect(body[1].content_media).toEqual([11848]);
    expect(body[2].content_media).toEqual([11822]);
    expect(body[0].content.rendered).toMatch("data-attachment-id='11857'");
    expect(body[1].content.rendered).toMatch("data-attachment-id='11848'");
    expect(body[2].content.rendered).toMatch("data-attachment-id='11822'");
    expect(body[0]._embedded['wp:contentmedia'][0][0]).toEqual(media11857);
    expect(body[1]._embedded['wp:contentmedia'][0][0]).toEqual(media11848);
    expect(body[2]._embedded['wp:contentmedia'][0][0]).toEqual(media11822);
    expect(body).toMatchSnapshot();
  });
  test('Should return the same data from the original request', async () => {
    nock('https://frontity.com')
      .get('/?rest_route=/wp/v2/media/11857&_embed=true')
      .reply(200, media11857);

    const body = (await axios(
      `${url}/https://frontity.com/?rest_route=/wp/v2/media/11857&_embed=true`,
    )).data;

    expect(body).toEqual(media11857);
    expect(body).toMatchSnapshot();
  });
  test('Should preserve any x-wp header', async () => {
    nock('https://frontity.com')
      .get('/?rest_route=/wp/v2/posts&_embed=true')
      .reply(200, { result: 'ok' }, { 'x-wp-custom': 'value' });
    const { headers } = await axios(
      `${url}/https://frontity.com/?rest_route=/wp/v2/posts&_embed=true`,
    );
    expect(headers['x-wp-custom']).toEqual('value');
  });
});
