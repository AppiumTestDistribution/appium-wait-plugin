import BasePlugin from '@appium/base-plugin';
import Element from './element';

export default class WaitCommandPlugin extends BasePlugin {
  async findElement(next, driver, ...args) {
    const element = new Element(driver, args);
    await element.find();
    return await next();
  }
}
