require('now-env');
const fetch = require('cross-fetch');
const { parse } = require('url');
const urlencodedBodyParser = require('urlencoded-body-parser');
const { send, createError, json } = require('micro');
const cors = require('micro-cors')();

module.exports = cors(async (req, res) => {
  try {
    const incomingData = await urlencodedBodyParser(req);
    console.log(incomingData);
    const { host } = parse(incomingData.url);
    const endpoints = [
      'visits',
      'pages-per-visit',
      'average-visit-duration',
      'bounce-rate',
    ];
    const response = await fetch(`https://api.similarweb.com/v1/website/${host}/total-traffic-and-engagement/${endpoints[0]}?api_key=${process.env.API_KEY}&start_date=2018-11&end_date=2018-11&main_domain_only=false&granularity=monthly`)
    const body = await response.json();
    return send(res, 200, body);
  } catch (error) {
    const status =
      error.statusCode || (error.response && error.response.status) || 500;

    return send(res, status, {
      error: {
        message: error.message,
        status,
      },
    });
  }
});
