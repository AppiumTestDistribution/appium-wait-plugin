import BasePlugin from '@appium/base-plugin';
import { find } from './element';

export default class WaitCommandPlugin extends BasePlugin {
  async findElement(next, driver, ...args) {
    await find(driver, args);
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
