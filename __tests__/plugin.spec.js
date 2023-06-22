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
import { defaultTimeOuts } from '../src/element';

const APPIUM_HOST = 'localhost';
const FAKE_ARGS = {
  timeout: 10000,
  intervalBetweenAttempts: 100,
  excludeEnabledCheck: ['clear', 'click'],
};
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

    it('Basic Plugin test', async () => {
      const res = { fake: 'fakeResponse' };
      (await axios.post('http://localhost:4723/fake')).data.should.eql(res);
    });

    it('Should be able to get default plugin props after session creation', async () => {
      expect(await driver.executeScript('plugin: getWaitPluginProperties', [])).to.deep.include(
        FAKE_ARGS
      );
    });

    it('Should be able to override and get props', async () => {
      await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          timeout: 1111,
          intervalBetweenAttempts: 11,
          excludeEnabledCheck: ['click'],
        },
      ]);
      await driver.$('#AlertButton');
      expect(await driver.executeScript('plugin: getWaitPluginProperties', [])).to.deep.include({
        timeout: 1111,
        intervalBetweenAttempts: 11,
        excludeEnabledCheck: ['click'],
      });
    });

    it('Should be able to override only timeout and get props', async () => {
      await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          timeout: 1111,
        },
      ]);
      await driver.$('#AlertButton');
      expect(await driver.executeScript('plugin: getWaitPluginProperties', [])).to.deep.include({
        timeout: 1111,
        intervalBetweenAttempts: FAKE_ARGS.intervalBetweenAttempts,
        excludeEnabledCheck: FAKE_ARGS.excludeEnabledCheck,
      });
    });

    it('Should be able to override only intervalBetweenAttempts and get props', async () => {
      await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          intervalBetweenAttempts: 900,
        },
      ]);
      await driver.$('#AlertButton');
      expect(await driver.executeScript('plugin: getWaitPluginProperties', [])).to.deep.include({
        timeout: FAKE_ARGS.timeout,
        intervalBetweenAttempts: 900,
        excludeEnabledCheck: FAKE_ARGS.excludeEnabledCheck,
      });
    });

    it('Should be able to override only excludeEnabledCheck and get props', async () => {
      await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          excludeEnabledCheck: ['clear'],
        },
      ]);
      await driver.$('#AlertButton');
      expect(await driver.executeScript('plugin: getWaitPluginProperties', [])).to.deep.include({
        timeout: FAKE_ARGS.timeout,
        intervalBetweenAttempts: FAKE_ARGS.intervalBetweenAttempts,
        excludeEnabledCheck: ['clear'],
      });
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

    it('Should be able to get default plugin props after session creation', async () => {
      expect(await driver.executeScript('plugin: getWaitPluginProperties', [])).to.deep.include(
        defaultTimeOuts
      );
    });

    it('Should be able to override and get props after session creation', async () => {
      await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          timeout: 1111,
          intervalBetweenAttempts: 11,
          excludeEnabledCheck: ['click'],
        },
      ]);
      await driver.$('#AlertButton');
      expect(await driver.executeScript('plugin: getWaitPluginProperties', [])).to.deep.include({
        timeout: 1111,
        intervalBetweenAttempts: 11,
        excludeEnabledCheck: ['click'],
      });
    });

    it('Should be able to override only timeout and get props', async () => {
      await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          timeout: 1111,
        },
      ]);
      await driver.$('#AlertButton');
      expect(await driver.executeScript('plugin: getWaitPluginProperties', [])).to.deep.include({
        timeout: 1111,
        intervalBetweenAttempts: defaultTimeOuts.intervalBetweenAttempts,
        excludeEnabledCheck: defaultTimeOuts.excludeEnabledCheck,
      });
    });

    it('Should be able to override only intervalBetweenAttempts and get props', async () => {
      await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          intervalBetweenAttempts: 900,
        },
      ]);
      await driver.$('#AlertButton');
      expect(await driver.executeScript('plugin: getWaitPluginProperties', [])).to.deep.include({
        timeout: defaultTimeOuts.timeout,
        intervalBetweenAttempts: 900,
        excludeEnabledCheck: defaultTimeOuts.excludeEnabledCheck,
      });
    });

    it('Should be able to override only excludeEnabledCheck and get props', async () => {
      await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          excludeEnabledCheck: ['clear'],
        },
      ]);
      await driver.$('#AlertButton');
      expect(await driver.executeScript('plugin: getWaitPluginProperties', [])).to.deep.include({
        timeout: defaultTimeOuts.timeout,
        intervalBetweenAttempts: defaultTimeOuts.intervalBetweenAttempts,
        excludeEnabledCheck: ['clear'],
      });
    });

    it('Should be able to override plugin props multiple times get props', async () => {
      await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          excludeEnabledCheck: ['clear'],
        },
      ]);
      await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          timeout: 8000,
          excludeEnabledCheck: [],
        },
      ]);
      await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          intervalBetweenAttempts: 800,
        },
      ]);
      expect(await driver.executeScript('plugin: getWaitPluginProperties', [])).to.deep.include({
        timeout: 8000,
        intervalBetweenAttempts: 800,
        excludeEnabledCheck: [],
      });
    });

    afterEach(async () => {
      await driver.deleteSession();
      if (server) await server.close();
    });
  });

  describe('Wrong contract', () => {
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

    it('Should not be set plugin props with timeout not as number', async () => {
      await expect(
        driver.executeScript('plugin: setWaitPluginProperties', [
          {
            timeout: '1200',
          },
        ])
      ).to.be.rejectedWith(
        Error,
        'An unknown server-side error occurred while processing the command. Original error: Wait plugin properties didnot match contract.'
      );
    });

    it('Should not be set plugin props with intervalBetweenAttempts not as number', async () => {
      await expect(
        driver.executeScript('plugin: setWaitPluginProperties', [
          {
            intervalBetweenAttempts: '30',
          },
        ])
      ).to.be.rejectedWith(
        Error,
        'An unknown server-side error occurred while processing the command. Original error: Wait plugin properties didnot match contract.'
      );
    });

    it('Should not be set plugin props with excludeEnabledCheck not as Array', async () => {
      await expect(
        driver.executeScript('plugin: setWaitPluginProperties', [
          {
            excludeEnabledCheck: {},
          },
        ])
      ).to.be.rejectedWith(
        Error,
        'An unknown server-side error occurred while processing the command. Original error: Wait plugin properties didnot match contract.'
      );
    });

    afterEach(async () => {
      if (driver) await driver.deleteSession();
      if (server) await server.close();
    });
  });
});
