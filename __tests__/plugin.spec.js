import { remote } from 'webdriverio';
import { pluginE2EHarness } from '@appium/plugin-test-support';
import path from 'path';
var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
// eslint-disable-next-line no-undef
should = chai.should();
let expect = chai.expect;
import axios from 'axios';

const APPIUM_HOST = 'localhost';
const FAKE_ARGS = { timeout: 10000, intervalBetweenAttempts: 1000 };
const FAKE_PLUGIN_ARGS = { 'element-wait': FAKE_ARGS };

const THIS_PLUGIN_DIR = path.join(__dirname, '..', '..');
const APPIUM_HOME = path.join(THIS_PLUGIN_DIR, 'local_appium_home');
const FAKE_DRIVER_DIR = '@appium/fake-driver';
const TEST_HOST = 'localhost';
const TEST_PORT = 4723;
const TEST_FAKE_APP = path.join(
  APPIUM_HOME,
  'node_modules',
  '@appium',
  'fake-driver',
  'test',
  'fixtures',
  'app.xml'
);
let server;
const WDIO_PARAMS = {
  connectionRetryCount: 0,
  hostname: APPIUM_HOST,
  port: 4723,
  path: '/wd/hub',
};
const capabilities = {
  platformName: 'Fake',
  'appium:automationName': 'Fake',
  'appium:app': TEST_FAKE_APP,
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
      driverName: 'fake',
      driverSource: 'npm',
      driverSpec: FAKE_DRIVER_DIR,
      pluginName: 'element-wait',
      pluginSource: 'local',
      pluginSpec: '.',
    });
    beforeEach(async () => {
      driver = await remote({ ...WDIO_PARAMS, capabilities });
    });
    it('Should be able to set and get waitPlugin timeout', async () => {
      await driver.$('id=AlertButton');
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

    it('Basic Plugin test', async () => {
      const res = { fake: 'fakeResponse' };
      (await axios.post('http://localhost:4723/fake')).data.should.eql(res);
    });

    afterEach(async () => {
      await driver.deleteSession();
      if (server) await server.close();
    });
  });

  describe('without CLI args', () => {
    let driver;
    pluginE2EHarness({
      before,
      after,
      server,
      serverArgs: { basePath: '/wd/hub' },
      port: TEST_PORT,
      host: TEST_HOST,
      appiumHome: APPIUM_HOME,
      driverName: 'fake',
      driverSource: 'npm',
      driverSpec: FAKE_DRIVER_DIR,
      pluginName: 'element-wait',
      pluginSource: 'local',
      pluginSpec: '.',
    });
    beforeEach(async () => {
      driver = await remote({ ...WDIO_PARAMS, capabilities });
    });

    it('Should be able to set and get waitPlugin timeout', async () => {
      await driver.$('#AlertButton');
      expect(await driver.executeScript('plugin: getWaitTimeout', [])).to.deep.include({
        timeout: 10000,
        intervalBetweenAttempts: 500,
      });
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
