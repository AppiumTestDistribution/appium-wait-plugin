import { main as startAppium } from 'appium';
import { remote } from 'webdriverio';
import { command } from 'webdriver';
var chai = require('chai'),
  // eslint-disable-next-line no-unused-vars
  should = chai.should();
let expect = chai.expect;
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

describe('Set Timeout', () => {
  const WDIO_PARAMS = {
    connectionRetryCount: 0,
    hostname: APPIUM_HOST,
    port: 4723,
    path: '/wd/hub',
  };
  const capabilities = {
    platformName: 'Fake',
    'appium:automationName': 'Fake',
    'appium:app': require.resolve('../node_modules/@appium/fake-driver/test/fixtures/app.xml'),
  };
  let driver;
  beforeEach(async () => {
    const port = '4723';
    const baseArgs = {
      port,
      address: APPIUM_HOST,
      basePath: '/wd/hub',
      usePlugins: ['element-wait'],
    };
    server = await startAppium(baseArgs);
    driver = await remote({ ...WDIO_PARAMS, capabilities });

    driver.addCommand(
      'setWaitPluginTimeout',
      command('POST', '/session/:sessionId/waitplugin/timeout', {
        command: 'setWaitPluginTimeout',
        parameters: [
          {
            name: 'data',
            type: 'object',
            description: 'a valid parameter',
            required: true,
          },
        ],
      })
    );
    driver.addCommand(
      'getWaitTimeout',
      command('GET', '/session/:sessionId/waitplugin/getTimeout', {
        command: 'getWaitTimeout',
        parameters: [],
        returns: {
          type: 'object',
          name: 'activity',
          description: 'Name of the current activity',
        },
      })
    );
  });
  it('Should be able to set and get waitPlugin timeout', async () => {
    await driver.setWaitPluginTimeout({ timeout: 1111, intervalBetweenAttempts: 11 });
    await driver.saveScreenshot('/Users/saikrisv/Documents/git/appium-wait-plugin/a.png');
    expect(await driver.getWaitTimeout()).to.deep.include({
      timeout: 1111,
      intervalBetweenAttempts: 11,
      overrideTimeout: true,
    });
  });

  afterEach(async () => {
    await driver.deleteSession();
    if (server) await server.close();
  });
});
