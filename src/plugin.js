import BasePlugin from '@appium/base-plugin';
import fetch from 'node-fetch';

let retryCount = 0;
export default class WaitCommandPlugin extends BasePlugin {
  async findElement(next, driver, ...args) {
    const locatorArgs = JSON.parse(JSON.stringify(args));
    let originalRes;
    await this._find(driver, locatorArgs, next);
    originalRes = await next();
    retryCount = 0;
    return originalRes;
  }

  async _find(driver, locatorArgs, next) {
    const response = await fetch(
      `http://${driver.uiautomator2.host}:${driver.uiautomator2.systemPort}/wd/hub/session/${driver.sessionId}/element`,
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
    if (json.value.error) {
      if (retryCount !== 25) {
        console.log(json.value.error, 'Retying...', retryCount);
        retryCount++;
        await this._find(driver, locatorArgs);
      }
    }
  }
}
