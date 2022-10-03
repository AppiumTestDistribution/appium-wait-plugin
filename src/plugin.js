import BasePlugin from '@appium/base-plugin';
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

  async setWait(next, driver, ...args) {
    await setWait(driver, args);
  }

  async getWaitTimeout(next, driver, ...args) {
    return await _getTimeout(driver.sessionId);
  }

  async findElement(next, driver, ...args) {
    let commandLineArgs = this.cliArgs;
    await find(driver, args, commandLineArgs);
    return await next();
  }

  async handle(next, driver, cmdName, ...args) {
    const includeCommands = ['click', 'setValue', 'clear'];
    if (includeCommands.includes(cmdName)) {
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
