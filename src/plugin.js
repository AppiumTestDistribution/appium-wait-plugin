import BasePlugin from '@appium/base-plugin';
import { find } from './element';

export default class WaitCommandPlugin extends BasePlugin {
  async findElement(next, driver, ...args) {
    await find(driver, args);
    return await next();
  }

  async handle(next, driver, cmdName, ...args) {
    if (cmdName === 'click' || cmdName === 'setValue') {
      const locatorArgs = JSON.parse(JSON.stringify(args));
      const elementId = locatorArgs[0];
      const isEnabled = await driver.elementEnabled(elementId);
      if (!isEnabled) throw new Error('Element is not enabled!');
    }
    return await next();
  }
}
