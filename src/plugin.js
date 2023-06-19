import { BasePlugin } from 'appium/plugin';
import { find, elementEnabled, setWait, _getTimeout } from './element';
import log from './logger';
export default class WaitCommandPlugin extends BasePlugin {
  constructor(name, cliArgs = {}) {
    super(name, cliArgs);
    this.name = name;
  }
  // this plugin supports a non-standard 'compare images' command
  static newMethodMap = {
    '/session/:sessionId/waitplugin/timeout': {
      POST: {
        command: 'setWait',
        payloadParams: { required: ['data'] },
        neverProxy: true,
      },
    },
    '/session/:sessionId/waitplugin/getTimeout': {
      GET: {
        command: 'getWaitTimeout',
        neverProxy: true,
      },
    },
  };

  static executeMethodMap = /** @type {const} */ ({
    'plugin: getWaitTimeout': {
      command: 'getWaitTimeout',
    },

    'plugin: setWaitTimeout': {
      command: 'setWait',
      params: {
        optional: ['timeout', 'intervalBetweenAttempts', 'elementEnabledCheckExclusionCmdsList'],
      },
    },
  });

  async execute(next, driver, script, args) {
    return await this.executeMethod(next, driver, script, args);
  }

  async setWait(
    next,
    driver,
    timeout,
    intervalBetweenAttempts,
    elementEnabledCheckExclusionCmdsList
  ) {
    await setWait(driver, {
      timeout,
      intervalBetweenAttempts,
      elementEnabledCheckExclusionCmdsList,
    });
  }

  async getWaitTimeout(next, driver) {
    return await _getTimeout(driver.sessionId);
  }

  async findElement(next, driver, ...args) {
    let commandLineArgs = this.cliArgs;
    await find(driver, args, commandLineArgs);
    return await next();
  }

  async handle(next, driver, cmdName, ...args) {
    const includeCommands = ['click', 'setValue', 'clear'];
    const timeoutProp = _getTimeout(driver.sessionId);
    let executeCommands = [];
    if (timeoutProp) {
      executeCommands = timeoutProp.elementEnabledCheckExclusionCmdsList;
    }
    if (includeCommands.includes(cmdName) && !executeCommands.includes(cmdName)) {
      log.info('Wait for element to be clickable');
      await elementEnabled(driver, args[0]);
      log.info('Element is enabled');
    } else if (executeCommands.includes(cmdName)) {
      log.info(
        `Skipping 'elementEnabled' as ${cmdName} is present in element EnabledCheck Exclusion List.`
      );
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
