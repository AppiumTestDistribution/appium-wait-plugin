import { remote } from 'webdriverio';
import { resolve } from 'path';
var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
// eslint-disable-next-line no-undef
should = chai.should();
let expect = chai.expect;

const APPIUM_HOST = 'localhost';
const FAKE_ARGS = { timeout: 10000, intervalBetweenAttempts: 1000 };

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
    });
  });
});
