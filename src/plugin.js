import BasePlugin from '@appium/base-plugin';
import fetch from 'node-fetch';

let retryCount = 0;
export default class WaitCommandPlugin extends BasePlugin {
  async findElement(next, driver, ...args) {
    this.driver = driver;
    let originalRes;
    const locatorArgs = JSON.parse(JSON.stringify(args));
    this.strategy = locatorArgs[0];
    this.selector = locatorArgs[1];
    await this._find();
    await this._elementDisplayed();
    originalRes = await next();
    retryCount = 0;
    return originalRes;
  }

  async _find() {
    const baseUrl = this._constructSessionUrl();
    const element = await this.elementState(baseUrl);
    if (element.value.error) {
      if (retryCount !== this._getTimeout()) {
        this.logger.info(
          `Waiting to find element with ${this.strategy} strategy for ${this.selector} selector`
        );
        retryCount++;
        await this._find();
      }
    }

    if (element.sessionId && element.value.ELEMENT) {
      this.element = element.value.ELEMENT;
      this.logger.info(
        `Element with ${this.strategy} strategy for ${this.selector} selector found.`
      );
      retryCount = 0;
    }
  }

  async elementState(baseUrl) {
    const response = await fetch(
      `${baseUrl}wd/hub/session/${this.driver.sessionId}/element`,
      {
        body: JSON.stringify({
          strategy: this.strategy,
          selector: this.selector,
          context: '',
          multiple: false,
        }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return await response.json();
  }

  async _elementDisplayed() {
    this.logger.info(`Checking if ${this.selector} element is displayed`);
    const baseUrl = this._constructSessionUrl();
    const response = await this.elementDisplayed(baseUrl);
    if (response.value.error) {
      if (retryCount !== this._getTimeout()) {
        this.logger.info(
          `Retrying to check whether ${this.selector} element is displayed or not`
        );
        retryCount++;
        await this._elementDisplayed();
      }
    }
    if (response.sessionId && response.value === 'true') {
      this.logger.info(`${this.selector} element is displayed.`);
      retryCount = 0;
    }
  }

  async elementDisplayed(baseUrl) {
    const response = await fetch(
      `${baseUrl}wd/hub/session/${this.driver.sessionId}/element/${this.element}/attribute/displayed`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return await response.json();
  }

  _getAutomationName() {
    return this.driver.caps.automationName;
  }

  _constructSessionUrl() {
    const automationName = this._getAutomationName();
    if (automationName === 'XCuiTest') {
      return `${this.driver.wda.wdaBaseUrl}:${this.driver.wda.wdaLocalPort}/`;
    } else {
      return `http://${this.driver.uiautomator2.host}:${this.driver.uiautomator2.systemPort}/`;
    }
  }

  _getTimeout() {
    if (this.driver.caps['element-wait']) {
      return (this.timeout = this.driver.caps['element-wait']);
    } else {
      return (this.timeout = 30);
    }
  }
}
