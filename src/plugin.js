import BasePlugin from '@appium/base-plugin';
import {
  find,
  elementEnabled,
  setPluginProperties,
  getPluginProperties,
  defaultTimeOuts,
} from './element';
import log from './logger';
export default class WaitCommandPlugin extends BasePlugin {
  constructor(name, cliArgs = {}) {
    super(name, cliArgs);
    this.cliArgs = cliArgs;
    this.name = name;
  }

  static executeMethodMap = /** @type {const} */ ({
    'plugin: getWaitPluginProperties': {
      command: 'getPluginProperties',
    },

    'plugin: setWaitPluginProperties': {
      command: 'setPluginProperties',
      params: {
        optional: ['timeout', 'intervalBetweenAttempts', 'excludeEnabledCheck'],
      },
    },
  });

  async execute(next, driver, script, args) {
    return await this.executeMethod(next, driver, script, args);
  }

  async setPluginProperties(next, driver, timeout, intervalBetweenAttempts, excludeEnabledCheck) {
    await setPluginProperties(driver.sessionId, {
      timeout,
      intervalBetweenAttempts,
      excludeEnabledCheck,
    });
  }

  async getPluginProperties(next, driver) {
    return await getPluginProperties(driver.sessionId);
  }

  async createSession(next) {
    try {
      const result = await next();
      const sessionId = result.value[0];
      const props = Object.assign({}, defaultTimeOuts, this.cliArgs);
      await setPluginProperties(sessionId, props);
      const propset = await getPluginProperties(sessionId);
      log.info(`session ${sessionId} is created with ${JSON.stringify(propset)}`);
      return result;
    } catch (err) {
      log.error('Failed to create sessions');
      throw err;
    }
  }

  async findElement(next, driver, ...args) {
    let commandLineArgs = this.cliArgs;
    await find(driver, args, commandLineArgs);
    return await next();
  }

  async handle(next, driver, cmdName, ...args) {
    const includeCommands = ['click', 'setValue', 'clear'];
    const timeoutProp = await getPluginProperties(driver.sessionId);
    let executeCommands = [];
    if (timeoutProp) {
      executeCommands = timeoutProp.excludeEnabledCheck;
    }
    if (includeCommands.includes(cmdName) && !executeCommands.includes(cmdName)) {
      log.info('Wait for element to be clickable');
      await elementEnabled(driver, args[0]);
      log.info('Element is enabled');
    }
    return await next();
  }

  static fakeRoute(req, res) {
    res.send(JSON.stringify({ fake: 'fakeResponse' }));
  }

  // eslint-disable-next-line no-unused-vars,require-await
  static async updateServer(expressApp, httpServer) {
    expressApp.all('/fake', WaitCommandPlugin.fakeRoute);
  }
}
