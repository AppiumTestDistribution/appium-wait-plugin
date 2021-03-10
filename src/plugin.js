import BasePlugin from '@appium/base-plugin';
const retry = require('async-retry');

export default class WaitCommandPlugin extends BasePlugin {
  async findElement(next, driver, ...args) {
    await retry(
      async (bail) => {
        console.log(
          `Before findElement is run with args ${JSON.stringify(args)}`
        );
        let originalRes;
        try {
          originalRes = await next();
        } catch (err) {
          console.log('In plugin', err);
          throw new Error(err);
        }
        console.log(`After findElement is run`, originalRes);
        return originalRes;
      },
      {
        retries: 5,
        factor: 1,
      }
    );
  }
}
