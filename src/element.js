import fetch from 'node-fetch';
import log from './logger';
import { waitUntil, TimeoutError } from 'async-wait-until';

let map = new Map();

export async function find(driver, args) {
  let elementWaitProps;
  if (driver.opts.plugin != undefined) {
    elementWaitProps = JSON.parse(JSON.stringify(driver.opts.plugin['element-wait']));
  }
  const session = driver.sessionId;
  _setTimeout(elementWaitProps, session);
  let timeoutProp = _getTimeout(session);
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
    const element = await waitUntil(predicate, timeoutProp);
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
        `Time out after waiting for element ${selector} for ${timeoutProp.timeout} ms`
      );
    } else {
      console.error(e);
    }
  }
}

export async function setWait(driver, args) {
  _setTimeout(args[0], driver.sessionId, true);
}

export async function elementEnabled(driver, el) {
  let timeoutProp = _getTimeout(driver.sessionId);
  const predicate = async () => {
    const element = await driver.elementEnabled(el);
    if (element) {
      return element;
    } else {
      log.info('Waiting to find element to be enabled');
      return false;
    }
  };

  try {
    await waitUntil(predicate, timeoutProp);
  } catch (e) {
    if (e instanceof TimeoutError) {
      throw new Error(
        `Time out after waiting for element to be enabled for ${timeoutProp.timeout}`
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

function _setTimeout(
  elementWaitProps = {
    timeout: 10000,
    intervalBetweenAttempts: 500,
    overrideTimeout: false,
  },
  session,
  overrideTimeout = false
) {
  if (overrideTimeout && map.has(session)) {
    map.delete(session);
  }
  if (!map.has(session)) {
    log.info(`Timeout properties not set for session ${session}, trying to set one`);
    let defaultTimeoutProp = elementWaitProps;
    if (
      elementWaitProps.timeout != undefined &&
      elementWaitProps.timeout !== defaultTimeoutProp.timeout
    ) {
      defaultTimeoutProp.timeout = elementWaitProps.timeout;
      log.info(`Timeout is set to ${defaultTimeoutProp.timeout}`);
    }
    if (
      elementWaitProps.intervalBetweenAttempts != undefined &&
      elementWaitProps.intervalBetweenAttempts !== defaultTimeoutProp.intervalBetweenAttempts
    ) {
      defaultTimeoutProp.intervalBetweenAttempts = elementWaitProps.intervalBetweenAttempts;
      log.info(`Internal between attempts is set to ${defaultTimeoutProp.intervalBetweenAttempts}`);
    }
    map.set(session, defaultTimeoutProp);
  }
  log.info(
    `Timeout properties set for session ${session} is ${JSON.stringify(_getTimeout(session))} ms`
  );
}

export function _getTimeout(session) {
  return map.get(session);
}
