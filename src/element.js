import fetch from 'node-fetch';
import log from './logger';
import { waitUntil, TimeoutError } from 'async-wait-until';

const defaultConfig = {
  timeout: '10000',
  intervalBetweenAttempts: '500',
};

export async function find(driver, args, cliArgs) {
  _getTimeout(cliArgs);
  const locatorArgs = JSON.parse(JSON.stringify(args));
  const strategy = locatorArgs[0];
  const selector = locatorArgs[1];
  const predicate = async () => {
    const ele = await elementState(driver, strategy, selector);
    if (ele.value.error == undefined) {
      return ele;
    } else {
      log.info(`Waiting to find element with ${strategy} strategy for ${selector} selector`);
      return false;
    }
  };
  try {
    const element = await waitUntil(predicate, {
      timeout: defaultConfig.timeout,
      intervalBetweenAttempts: defaultConfig.intervalBetweenAttempts,
    });
    if (element.value.ELEMENT) {
      log.info(`Element with ${strategy} strategy for ${selector} selector found.`);
      let elementViewState = await elementIsDisplayed(driver, element.value.ELEMENT);
      if (elementViewState) log.info('Element is displayed!');
      if (!elementViewState)
        throw new Error(
          'Element was not displayed! Please make sure the element is in viewport to perform the action'
        );
    }
  } catch (e) {
    if (e instanceof TimeoutError) {
      throw new Error(
        `Time out after waiting for element ${selector} for ${defaultConfig.timeout}`
      );
    } else {
      console.error(e);
    }
  }
}

async function elementIsDisplayed(driver, element) {
  log.info('Check if element is displayed');
  return await driver.elementDisplayed(element);
}

async function elementState(driver, strategy, selector) {
  const sessionDetails = sessionInfo(driver, strategy, selector);
  const response = await fetch(
    `${sessionDetails.baseUrl}session/${sessionDetails.jwProxySession}/element`,
    {
      body: sessionDetails.body,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return await response.json();
}

function _getAutomationName(driver) {
  return driver.caps.automationName;
}

function sessionInfo(driver, strategy, selector) {
  const automationName = _getAutomationName(driver);
  if (automationName === 'XCuiTest') {
    return {
      baseUrl: `http://${driver.wda.webDriverAgentUrl}`,
      jwProxySession: driver.wda.jwproxy.sessionId,
      body: JSON.stringify({
        using: strategy,
        value: selector,
      }),
    };
  } else {
    return {
      baseUrl: `http://${driver.uiautomator2.host}:${driver.uiautomator2.systemPort}/`,
      jwProxySession: driver.uiautomator2.jwproxy.sessionId,
      body: JSON.stringify({
        strategy,
        selector,
        context: '',
        multiple: false,
      }),
    };
  }
}

function _getTimeout(cliArgs) {
  if (cliArgs.timeout != undefined && cliArgs.timeout !== defaultConfig.timeout) {
    defaultConfig.timeout = cliArgs.timeout;
    log.info(`Timeout is set to ${defaultConfig.timeout}`);
  }
  if (
    cliArgs.intervalBetweenAttempts != undefined &&
    cliArgs.intervalBetweenAttempts !== defaultConfig.intervalBetweenAttempts
  ) {
    defaultConfig.intervalBetweenAttempts = cliArgs.intervalBetweenAttempts;
    log.info(`Internal between attempts is set to ${defaultConfig.intervalBetweenAttempts}`);
  }
}
