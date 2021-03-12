import BasePlugin from '@appium/base-plugin';
import fetch from 'node-fetch';

let retryCount = 0;
export default class WaitCommandPlugin extends BasePlugin {
  async findElement(next, driver, ...args) {
    const locatorArgs = JSON.parse(JSON.stringify(args));
    let originalRes;
    await this._find(driver, locatorArgs);
    originalRes = await next();
    retryCount = 0;
    return originalRes;
  }

  async _find(driver, locatorArgs) {
    const strategy = locatorArgs[0];
    const selector = locatorArgs[1];
    const automationName = this._getAutomationName(driver);
    const response = await fetch(
      `http://${driver[automationName].host}:${driver[automationName].systemPort}/wd/hub/session/${driver.sessionId}/element`,
      {
        body: JSON.stringify({
          strategy,
          selector,
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
        this.logger.info(
          `Retrying to find element with ${strategy} strategy for ${selector} selector`
        );
        retryCount++;
        await this._find(driver, locatorArgs);
      }
    }
  }

  _getAutomationName(driver) {
    return driver.caps.automationName.toLowerCase();
  }
}
