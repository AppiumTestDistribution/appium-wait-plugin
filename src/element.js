import fetch from 'node-fetch';
import log from './logger';
import { waitUntil } from 'async-wait-until';

const defaultConfig = {
  timeout: '10000',
  intervalBetweenAttempts: '500',
};
class Element {
  constructor(driver, args) {
    this.driver = driver;
    const locatorArgs = JSON.parse(JSON.stringify(args));
    this.strategy = locatorArgs[0];
    this.selector = locatorArgs[1];
    this.sessionInfo = this.sessionInfo(driver);
    this._getTimeout();
  }

  async find() {
    const element = await this.elementState();
    const predicate = async () => {
      if ((await this.elementState()).value.error == undefined) {
        return true;
      } else {
        log.info(
          `Waiting to find element with ${this.strategy} strategy for ${this.selector} selector`
        );
        return false;
      }
    };
    await waitUntil(predicate, {
      timeout: defaultConfig.timeout,
      intervalBetweenAttempts: defaultConfig.intervalBetweenAttempts,
    });
    if (element.value.ELEMENT) {
      let elementViewState = await this.elementIsDisplayed(
        element.value.ELEMENT
      );
      if (!elementViewState)
        log.error(
          'Element was not displayed! Please make sure the element is in viewport to perform an action'
        );
    }
  }

  async elementIsDisplayed(element) {
    log.info(
      `Element with ${this.strategy} strategy for ${this.selector} selector found.`
    );
    log.info('Check if element is displayed');
    return await this.driver.elementDisplayed(element);
  }

  async elementState() {
    const response = await fetch(
      `${this.sessionInfo.baseUrl}session/${this.sessionInfo.jwProxySession}/element`,
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
    if (this.driver.caps['element-wait-timeout']) {
      return (defaultConfig.timeout = this.driver.caps['element-wait-timeout']);
    }
    if (this.driver.caps['intervalBetweenAttempts']) {
      return (defaultConfig.intervalBetweenAttempts = this.driver.caps[
        'intervalBetweenAttempts'
      ]);
    }
  }

  async handle(next, driver, cmdName, ...args) {
    console.log(cmdName, ...args);
    return await next();
  }
}

export default Element;
