const { send } = require('micro');
const cors = require('micro-cors')();

module.exports = cors((req, res) => send(res, 200, 'In and out, twenty minutes adventure!'));
