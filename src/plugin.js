import BasePlugin from '@appium/base-plugin';
import fetch from 'node-fetch';

let retryCount = 0;
export default class WaitCommandPlugin extends BasePlugin {
  async findElement(next, driver, ...args) {
    const locatorArgs = JSON.parse(JSON.stringify(args));
    let originalRes;
    await this._find(driver, locatorArgs);
    await this._elementDisplayed(driver);
    originalRes = await next();
    retryCount = 0;
    return originalRes;
  }

  async _find(driver, locatorArgs) {
    const strategy = locatorArgs[0];
    const selector = locatorArgs[1];
    const baseUrl = this._constructSessionUrl(driver);
    const response = await fetch(
      `${baseUrl}wd/hub/session/${driver.sessionId}/element`,
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

    if (json.sessionId && json.value.ELEMENT) {
      this.element = json.value.ELEMENT;
      this.logger.info(
        `Element with ${strategy} strategy for ${selector} selector found.`
      );
    }
  }

  async _elementDisplayed(driver) {
    this.logger.info('Checking if element is displayed');
    const baseUrl = this._constructSessionUrl(driver);
    const response = await fetch(
      `${baseUrl}wd/hub/session/${driver.sessionId}/element/${this.element}/attribute/displayed`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const json = await response.json();
    if (json.value.error) {
      if (retryCount !== 25) {
        this.logger.info(
          `Retrying to check whether ${this.element} element is displayed or not`
        );
        retryCount++;
        await this._elementDisplayed(driver);
      }
    }
    if (json.sessionId && json.value === 'true') {
      this.logger.info(`Element with ${this.element} id is displayed.`);
    }
  }

  _getAutomationName(driver) {
    return driver.caps.automationName;
  }

  _constructSessionUrl(driver) {
    const automationName = this._getAutomationName(driver);
    if (automationName === 'XCuiTest') {
      return `${driver.wda.wdaBaseUrl}:${driver.wda.wdaLocalPort}/`;
    } else {
      return `http://${driver.uiautomator2.host}:${driver.uiautomator2.systemPort}/`;
    }
  }
}
