import { remote } from 'webdriverio';

const APPIUM_HOST = 'localhost';
const APPIUM_PORT = 4723;
const WDIO_PARAMS = {
  connectionRetryCount: 0,
  hostname: APPIUM_HOST,
  port: APPIUM_PORT,
  path: '/wd/hub/',
  logLevel: 'silent',
};
const capabilities = {
  platformName: 'Android',
  'appium:uiautomator2ServerInstallTimeout': '50000',
  'appium:automationName': 'UIAutomator2',
  'appium:app':
    'https://github.com/shridharkalagi/AppiumSample/blob/master/VodQA.apk?raw=true',
};
describe('Plugin Test', () => {
  it('Basic Plugin test', async () => {
    const driver = await remote({ ...WDIO_PARAMS, capabilities });
    await driver.$('~login').click();
    await driver.$('~slider1').click();
    await driver.deleteSession();
  });
});
