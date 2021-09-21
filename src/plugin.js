import BasePlugin from '@appium/base-plugin';
import fetch from 'node-fetch';
import log from './logger';

let retryCount = 0;
export default class WaitCommandPlugin extends BasePlugin {
  async findElement(next, driver, ...args) {
    this.driver = driver;
    let originalRes;
    const locatorArgs = JSON.parse(JSON.stringify(args));
    this.strategy = locatorArgs[0];
    this.selector = locatorArgs[1];
    const element = await this._find();
    await this._elementDisplayed(element);
    originalRes = await next();
    retryCount = 0;
    return originalRes;
  }

  async _find() {
    const baseUrl = this._constructSessionUrl();
    const element = await this.elementState(baseUrl);
    if (element.value.error) {
      if (retryCount !== this._getTimeout()) {
        log.info(
          `Waiting to find element with ${this.strategy} strategy for ${this.selector} selector`
        );
        retryCount++;
        await this._find();
      }
    }
    console.log(element, element.sessionId, !element.value.error);
    return element.value.ELEMENT;
  }

  async elementIsDisplayed(element) {
    log.info(
      `Element with ${this.strategy} strategy for ${this.selector} selector found.`
    );
    retryCount = 0;
    log.info('Check if element is displayed');
    await this.driver.elementDisplayed(element);
  }

  async elementState(baseUrl) {
    console.log(baseUrl);
    console.log(this.driver)
    const response = await fetch(
      `${baseUrl}wd/hub/session/${this.driver.uiautomator2.jwproxy.sessionId}/element`,
      {
        body: JSON.stringify({
          strategy: this.strategy,
          selector: this.selector,
          context: "",
          multiple: false,
        }),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return await response.json();
  }

  async _elementDisplayed(element) {
    log.info(`Checking if ${this.selector} element is displayed`);
    const response = await this.elementIsDisplayed(element);
    if (response.value.error) {
      if (retryCount !== this._getTimeout()) {
        log.info(
          `Retrying to check whether ${this.selector} element is displayed or not`
        );
        retryCount++;
        await this._elementDisplayed(element);
      }
    }
    if (response.sessionId && response.value === 'true') {
      log.info(`${this.selector} element is displayed.`);
      retryCount = 0;
    }
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
