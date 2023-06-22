import { remote } from 'webdriverio';
import { resolve } from 'path';
var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
// eslint-disable-next-line no-undef
should = chai.should();
let expect = chai.expect;

const APPIUM_HOST = '127.0.0.1';
const DEFAULT_TIMEOUT_VALUE = {
  timeout: 10000,
  intervalBetweenAttempts: 500,
  excludeEnabledCheck: [],
};

const androidApp = resolve('./build/VodQA.apk');
const iosApp = resolve('./build/vodqa.zip');

const WDIO_PARAMS = {
  connectionRetryCount: 220000,
  hostname: APPIUM_HOST,
  port: 4723,
  path: '/wd/hub',
};
const androidCaps = {
  platformName: 'Android',
  'appium:uiautomator2ServerInstallTimeout': '120000',
  'appium:automationName': 'UIAutomator2',
  'appium:app': androidApp,
};

const iOSCaps = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': 'iPhone 12',
  'appium:platformVersion': '16.2',
  'appium:app': iosApp,
  'appium:usePrebuiltWDA': true,
  'appium:wdaLaunchTimeout': 120000,
};

describe('Set Timeout', () => {
  describe('with CLI args', () => {
    let driver;
    beforeEach(async () => {
      driver = await remote({
        ...WDIO_PARAMS,
        capabilities: process.env.PLATFORM === 'android' ? androidCaps : iOSCaps,
      });
    });
    it('Should be able to get default properties and override/get properties', async () => {
      expect(await driver.executeScript('plugin: getWaitPluginProperties', [])).to.deep.include(
        DEFAULT_TIMEOUT_VALUE
      );
      await driver.$('~login').click();
      await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          timeout: 1111,
          intervalBetweenAttempts: 11,
        },
      ]);
      expect(await driver.executeScript('plugin: getWaitPluginProperties', [])).to.deep.include({
        timeout: 1111,
        intervalBetweenAttempts: 11,
      });
    });

    afterEach(async () => {
      await driver.deleteSession();
    });
  });
});
