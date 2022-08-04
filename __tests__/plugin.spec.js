import { main as startAppium } from 'appium';
var chai = require('chai'),
  // eslint-disable-next-line no-unused-vars
  should = chai.should();
import axios from 'axios';

const APPIUM_HOST = 'localhost';
const FAKE_ARGS = { sillyWebServerPort: 1234, host: 'hey' };
const FAKE_PLUGIN_ARGS = { fake: FAKE_ARGS };
let server;
describe('Plugin Test', () => {
  beforeEach('Start Server', async () => {
    const port = '4723';
    const baseArgs = {
      port,
      address: APPIUM_HOST,
      usePlugins: ['element-wait'],
    };
    const args = { ...baseArgs, plugin: FAKE_PLUGIN_ARGS };
    server = await startAppium(args);
  });
  it('Basic Plugin test', async () => {
    const res = { fake: 'fakeResponse' };
    (await axios.post('http://localhost:4723/fake')).data.should.eql(res);
  });

  afterEach('Stop server', async () => {
    if (server) await server.close();
  });
});
