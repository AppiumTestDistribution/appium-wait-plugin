import BasePlugin from '@appium/base-plugin';
import { find, elementEnabled } from './element';
import log from './logger';
export default class WaitCommandPlugin extends BasePlugin {
  async findElement(next, driver, ...args) {
    let commandLineArgs = this.cliArgs;
    await find(driver, args, commandLineArgs);
    return await next();
  }

  async handle(next, driver, cmdName, ...args) {
    console.log('CommandName', cmdName);
    console.log('Args', args);
    const includeCommands = ['click', 'setValue', 'clear'];
    if (includeCommands.includes(cmdName)) {
      log.info('Wait for element to be clickable');
      await elementEnabled(driver);
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