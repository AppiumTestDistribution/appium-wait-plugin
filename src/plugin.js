import BasePlugin from '@appium/base-plugin';
import fetch from 'node-fetch';

let retryCount = 0;
export default class WaitCommandPlugin extends BasePlugin {
  async findElement(next, driver, ...args) {
    const locatorArgs = JSON.parse(JSON.stringify(args));
    let originalRes;
    try {
      await this._find(driver, locatorArgs);
    } catch (e) {
      originalRes = await next();
    }
    return originalRes;
  }

  async _find(driver, locatorArgs) {
    const response = await fetch(
      `http://localhost:8200/wd/hub/session/${driver.sessionId}/element`,
      {
        body: JSON.stringify({
          strategy: locatorArgs[0],
          selector: locatorArgs[1],
          context: '',
          multiple: false,
        }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const json = await response.json();
    console.log(json);
    if (retryCount === 5) {
      throw new Error('Element not found...');
    }
    if (json.value.error) {
      console.log(json.value.error, 'Retying...');
      retryCount++;
      await this._find(driver, locatorArgs);
    }
  }
}
