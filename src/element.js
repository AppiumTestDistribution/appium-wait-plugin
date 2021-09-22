import fetch from 'node-fetch';
import log from './logger';

let retryCount = 0;
class Element {
  constructor(driver, args) {
    this.driver = driver;
    const locatorArgs = JSON.parse(JSON.stringify(args));
    this.strategy = locatorArgs[0];
    this.selector = locatorArgs[1];
    this.sessionInfo = this.sessionInfo(driver);
  }

  async find() {
    const element = await this.elementState();
    if (element.value.error) {
      if (retryCount !== this._getTimeout()) {
        log.info(
          `Waiting to find element with ${this.strategy} strategy for ${this.selector} selector`
        );
        retryCount++;
        await this.find();
      }
    }
    if (element.value.ELEMENT) await this.isDisplayed(element.value.ELEMENT);
  }

  async elementIsDisplayed(element) {
    log.info(
      `Element with ${this.strategy} strategy for ${this.selector} selector found.`
    );
    retryCount = 0;
    log.info('Check if element is displayed');
    return await this.driver.elementDisplayed(element);
  }

  async elementState() {
    const response = await fetch(
      `${this.sessionInfo.baseUrl}wd/hub/session/${this.sessionInfo.jwProxySession}/element`,
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

  async isDisplayed(element) {
    log.info(`Checking if ${this.selector} element is displayed`);
    const response = await this.elementIsDisplayed(element);
    if (!response) {
      if (retryCount !== this._getTimeout()) {
        log.info(
          `Retrying to check whether ${this.selector} element is displayed or not`
        );
        retryCount++;
        await this.isDisplayed(element);
      }
    }
    if (response) {
      log.info(`${this.selector} element is displayed.`);
      retryCount = 0;
    }
  }

  _getAutomationName() {
    return this.driver.caps.automationName;
  }

  sessionInfo(driver) {
    const automationName = this._getAutomationName();
    if (automationName === 'XCuiTest') {
      return {
        baseUrl: `${driver.wda.wdaBaseUrl}:${driver.wda.wdaLocalPort}/`,
        jwProxySession: driver.wda.jwproxy.sessionId,
      };
    } else {
      return {
        baseUrl: `http://${driver.uiautomator2.host}:${driver.uiautomator2.systemPort}/`,
        jwProxySession: driver.uiautomator2.jwproxy.sessionId,
      };
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

export default Element;
