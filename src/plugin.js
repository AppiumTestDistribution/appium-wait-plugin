import BasePlugin from '@appium/base-plugin';
import { find } from './element';

export default class WaitCommandPlugin extends BasePlugin {
  async findElement(next, driver, ...args) {
    await find(driver, args);
    return await next();
  }
}
