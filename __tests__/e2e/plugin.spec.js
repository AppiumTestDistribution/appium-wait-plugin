import { remote } from 'webdriverio';
import { pluginE2EHarness } from '@appium/plugin-test-support';
import path from 'path';
var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
// eslint-disable-next-line no-undef
should = chai.should();
let expect = chai.expect;

const APPIUM_HOST = 'localhost';
const FAKE_ARGS = { timeout: 10000, intervalBetweenAttempts: 1000 };
const FAKE_PLUGIN_ARGS = { 'element-wait': FAKE_ARGS };

const THIS_PLUGIN_DIR = path.join(__dirname, '..', '..');
const APPIUM_HOME = path.join(THIS_PLUGIN_DIR, 'local_appium_home');
const FAKE_DRIVER_DIR =
  process.env.PLATFORM === 'android' ? 'appium-uiautomator2-driver' : 'appium-xcuitest-driver';
const TEST_HOST = 'localhost';
const TEST_PORT = 4723;

let server;
const WDIO_PARAMS = {
  connectionRetryCount: 0,
  hostname: APPIUM_HOST,
  port: 4723,
  path: '/wd/hub',
};
const androidCaps = {
  platformName: 'Android',
  'appium:uiautomator2ServerInstallTimeout': '120000',
  'appium:automationName': 'XCUITest',
  'appium:app':
    'https://github.com/AppiumTestDistribution/appium-demo/blob/main/VodQA.apk?raw=true',
};

const iOSCaps = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': 'iPhone 14 Pro',
  'appium:platformVersion': '16.2',
  'appium:app':
    'https://github.com/AppiumTestDistribution/appium-demo/blob/main/vodqa.zip?raw=true',
};

describe('Set Timeout', () => {
  describe('with CLI args', () => {
    let driver;
    pluginE2EHarness({
      before,
      after,
      server,
      serverArgs: { basePath: '/wd/hub', plugin: FAKE_PLUGIN_ARGS },
      port: TEST_PORT,
      host: TEST_HOST,
      appiumHome: APPIUM_HOME,
      driverName: process.env.PLATFORM === 'android' ? 'uiautomator2' : 'xcuitest',
      driverSource: 'npm',
      driverSpec: FAKE_DRIVER_DIR,
      pluginName: 'element-wait',
      pluginSource: 'local',
      pluginSpec: '.',
    });
    beforeEach(async () => {
      driver = await remote({
        ...WDIO_PARAMS,
        capabilities: process.env.PLATFORM === 'android' ? androidCaps : iOSCaps,
      });
    });
    it('Should be able to set and get waitPlugin timeout', async () => {
      await driver.$('~login').click();
      expect(await driver.executeScript('plugin: getWaitTimeout', [])).to.deep.include(FAKE_ARGS);
      await driver.executeScript('plugin: setWaitTimeout', [
        {
          timeout: 1111,
          intervalBetweenAttempts: 11,
        },
      ]);
      expect(await driver.executeScript('plugin: getWaitTimeout', [])).to.deep.include({
        timeout: 1111,
        intervalBetweenAttempts: 11,
      });
    });

    afterEach(async () => {
      await driver.deleteSession();
      if (server) await server.close();
    });
  });
});
