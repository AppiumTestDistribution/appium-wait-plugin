import log from './logger';
import { waitUntil, TimeoutError } from 'async-wait-until';
import ora from 'ora';
import { errors } from '@appium/base-driver';
import axios from 'axios';

let map = new Map();
export const defaultTimeOuts = {
  timeout: 10000,
  intervalBetweenAttempts: 500,
  excludeEnabledCheck: [],
};

export async function find(driver, args) {
  const session = driver.sessionId;
  let timeoutProp = _getPluginProperties(session) || defaultTimeOuts;
  const locatorArgs = JSON.parse(JSON.stringify(args));
  const strategy = locatorArgs[0];
  const selector = locatorArgs[1];
  const sessionInformation = sessionInfo(driver);
  const predicate = async () => {
    if (_getAutomationName(driver) === 'Fake') {
      try {
        const element = await driver.findElement(strategy, selector);
        return {
          value: {
            ELEMENT: element.ELEMENT,
          },
        };
      } catch (e) {
        return false;
      }
    } else {
      const ele = await elementState(sessionInformation, strategy, selector, driver);
      if (ele.value.error === undefined) {
        return ele;
      } else {
        return false;
      }
    }
  };
  let spinner;
  try {
    spinner = ora(
      `Waiting to find element with ${strategy} strategy for ${selector} selector`
    ).start();
    const element = await waitUntil(predicate, timeoutProp);
    log.info(`Element with ${strategy} strategy for ${selector} selector found.`);
    let elementViewState = await elementIsDisplayed(driver, element.value.ELEMENT);
    if (elementViewState) log.info('Element is displayed!');
    if (!elementViewState)
      throw new errors.ElementNotVisibleError(
        'Element was not displayed! Please make sure the element is in viewport to perform the action'
      );
    spinner.succeed();
  } catch (e) {
    if (e instanceof TimeoutError) {
      spinner.fail();
      throw new errors.NoSuchElementError(
        `Time out after waiting for element ${selector} for ${timeoutProp.timeout} ms`
      );
    } else {
      console.error(e);
    }
  }
}

export async function getPluginProperties(sessionId) {
  return _getPluginProperties(sessionId);
}

export async function setPluginProperties(sessionId, args) {
  _setPluginProperties(args, sessionId);
}

export async function elementEnabled(driver, el) {
  let timeoutProp = _getPluginProperties(driver.sessionId);
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

function _getAutomationName(driver) {
  return driver.caps.automationName;
}

function sessionInfo(driver) {
  if (driver.caps.automationName === 'Fake') return;
  const automationName = _getAutomationName(driver);
  if (automationName.toLowerCase() === 'xcuitest') {
    return {
      baseUrl: `${driver.wda.webDriverAgentUrl}`,
      jwProxySession: driver.wda.jwproxy.sessionId,
    };
  } else {
    return {
      baseUrl: `http://${driver.uiautomator2.jwproxy.server}:${driver.uiautomator2.jwproxy.port}/`,
      jwProxySession: driver.uiautomator2.jwproxy.sessionId,
    };
  }
}

async function elementState(sessionInfo, strategy, selector, driver) {
  let automationName = _getAutomationName(driver);
  let postBody;
  if (automationName.toLowerCase() === 'xcuitest') {
    postBody = JSON.stringify({
      using: strategy,
      value: selector,
    });
  } else {
    postBody = JSON.stringify({
      strategy,
      selector,
      context: '',
      multiple: false,
    });
  }
  const response = await axios.post(
    `${sessionInfo.baseUrl}session/${sessionInfo.jwProxySession}/element`,
    postBody,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

function _getPluginProperties(sessionId) {
  return map.get(sessionId);
}

function _setPluginProperties(elementWaitProps, sessionId) {
  const props = _getPluginProperties(sessionId) || Object.assign({}, defaultTimeOuts);
  props.timeout = elementWaitProps.timeout || props.timeout;
  props.intervalBetweenAttempts =
    elementWaitProps.intervalBetweenAttempts || props.intervalBetweenAttempts;
  props.excludeEnabledCheck = elementWaitProps.excludeEnabledCheck || props.excludeEnabledCheck;

  if (
    typeof props.timeout !== 'number' ||
    typeof props.intervalBetweenAttempts !== 'number' ||
    !Array.isArray(props.excludeEnabledCheck)
  ) {
    log.error('Plugin properties sent are not matching the expected contract');
    log.error(
      'Expected contract "timeout" and "intervalBetweenAttempts" should be number and excludeEnabledCheck should be array'
    );
    log.error(`example of expected contract ${JSON.stringify(defaultTimeOuts)}`);
    log.error(`Got ${JSON.stringify(props)}`);
    throw new Error('Wait plugin properties didnot match contract.');
  }

  map.set(sessionId, props);
  log.info(
    `Timeout properties set for session ${sessionId} is ${JSON.stringify(
      _getPluginProperties(sessionId)
    )}`
  );
}
