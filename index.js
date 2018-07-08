const {WireBot} = require('./');

const bot = new WireBot({
  auth: 'auth-123',
  cert: './certificates/server.crt',
  key: './certificates/server.key',
  port: 1234,
  storePath: './temp',
});

bot.start();
