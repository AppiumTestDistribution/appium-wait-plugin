import { remote } from 'webdriverio';
import { command } from 'webdriver';

const APPIUM_HOST = '127.0.0.1';
const APPIUM_PORT = 31337;
const WDIO_PARAMS = {
  connectionRetryCount: 0,
  hostname: APPIUM_HOST,
  port: APPIUM_PORT,
  path: '/wd/hub',
};
const capabilities = {
  platformName: 'Fake',
  'appium:automationName': 'Fake',
  'appium:app': require.resolve('../node_modules/@appium/fake-driver/test/fixtures/app.xml'),
};
let driver;

describe('Plugin Test', () => {
  beforeEach(async () => {
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
  });

  it('Vertical swipe test', async () => {
    await driver.setWaitPluginTimeout({ timeout: 1111, intervalBetweenAttempts: 11 });
  });

  afterEach(async () => {
    await driver.deleteSession();
  });
});
