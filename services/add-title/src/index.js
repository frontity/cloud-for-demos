const { parse } = require('url');
const { send, createError } = require('micro');
const cors = require('micro-cors')();
const axios = require('axios');

module.exports = cors(async (req, res) => {
  try {
    const [initialUrl] = req.url.replace('/', '').match(/http.+$/) || [''];
    const { protocol, hostname, search } = parse(initialUrl);
    if (!protocol || !hostname)
      throw createError(500, `Invalid url: ${initialUrl}`);

    // Function to request data from Rest API.
    const requestData = async query => {
      const response = await axios({
        method: 'get',
        url: `${protocol}//${hostname}/${query || ''}`,
        headers: {
          'user-agent': req.headers['user-agent'],
          host: hostname,
        },
        responseType: 'json',
      });
      console.log('response:', response);
      return response.data;
    };

    // Function to return data with title populated.
    const getModifiedData = data => {
      const { title } = data;

      if (typeof title === 'string') {
        return {
          ...data,
          title: {
            rendered: title,
            text: title,
          },
        };
      }

      if (typeof title === 'object') {
        const { rendered, text } = title;

        if (rendered)
          return {
            ...data,
            title: {
              rendered,
              text: rendered.replace(/<\/?[^>]+(>|$)/g, ''),
            },
          };

        if (text)
          return {
            ...data,
            title: {
              rendered: text,
              text,
            },
          };
      }

      return data;
    };

    // Get data from original call.
    const data = await requestData(search);
    console.log('after request');

    // Check if data is a list of entities with titles.
    if (Array.isArray(data)) {
      return send(
        res,
        200,
        data.map(entity => (entity.title ? getModifiedData(entity) : entity)),
      );
    }

    // Check if data is an entity with title.
    if (data.title) {
      return send(res, 200, getModifiedData(data));
    }

    return send(res, 200, data);
  } catch (error) {
    return send(res, error.statusCode, {
      error: {
        text: error.message,
        status: error.statusCode,
      },
    });
  }
});
