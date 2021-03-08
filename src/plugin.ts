import BasePlugin from '@appium/base-plugin';

export default class WaitCommandPlugin extends BasePlugin {
  async findElement(next, driver, ...args) {
    console.log(`Before findElement is run with args ${JSON.stringify(args)}`);
    const originalRes = await next();
    console.log(`After findElement is run`);
    return originalRes;
  }
}
