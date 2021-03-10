import BasePlugin from '@appium/base-plugin';
import fetch from 'node-fetch';
const retry = require('async-retry');

export default class WaitCommandPlugin extends BasePlugin {
  async findElement(next, driver, ...args) {
    console.log(`Before findElement is run with args ${JSON.stringify(args)}`);
    let originalRes;
    const response = await fetch(
      `http://localhost:8200/wd/hub/session/${driver.sessionId}/element`,
      {
        body: JSON.stringify({ using: 'accessibility id', value: 'Views' }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const json = await response.json();
    console.log('====================================');
    console.log(json);
    console.log('====================================');
    originalRes = await next();
    console.log('After findElement is run', originalRes);
    console.log('driver details', driver);
    return originalRes;
  }
}
