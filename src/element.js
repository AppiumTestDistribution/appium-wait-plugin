import log from './logger';
import { waitUntil, TimeoutError } from 'async-wait-until';
import ora from 'ora';
import { errors } from 'appium/driver';

let map = new Map();
const defaultTimeOuts = {
  timeout: 10000,
  intervalBetweenAttempts: 500,
  elementEnabledCheckExclusionCmdsList: [],
};

export async function find(driver, args) {
  const session = driver.sessionId;
  const currentTimeouts = _getTimeout(session);
  if (!currentTimeouts) {
    let elementWaitProps;
    if (driver.opts.plugin !== undefined && driver.opts.plugin['element-wait'] !== undefined) {
      elementWaitProps = JSON.parse(JSON.stringify(driver.opts.plugin['element-wait']));
    }
    _setTimeout(elementWaitProps, session);
  }
  let timeoutProp = _getTimeout(session);
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

export function _getTimeout(session) {
  return map.get(session);
}

export async function setWait(driver, args) {
  _setTimeout(args, driver.sessionId, true);
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

function _getAutomationName(driver) {
  return driver.caps.automationName;
}

function sessionInfo(driver) {
  if (driver.caps.automationName === 'Fake') return;
  const automationName = _getAutomationName(driver);
  if (automationName === 'XCuiTest') {
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
  if (automationName === 'XCuiTest') {
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
  const response = await fetch(
    `${sessionInfo.baseUrl}session/${sessionInfo.jwProxySession}/element`,
    {
      body: postBody,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return await response.json();
}

function _setTimeout(elementWaitProps = defaultTimeOuts, session, overrideTimeout = false) {
  if (!overrideTimeout) {
    map.set(session, elementWaitProps);
    log.info(
      `Timeout properties are set/reset for session ${session} as ${JSON.stringify(
        _getTimeout(session)
      )}`
    );
    return;
  }
  let newtimeouts = Object.assign({}, _getTimeout(session));
  if (elementWaitProps.timeout) {
    newtimeouts.timeout = elementWaitProps.timeout;
  }
  if (elementWaitProps.intervalBetweenAttempts) {
    newtimeouts.intervalBetweenAttempts = elementWaitProps.intervalBetweenAttempts;
  }
  if (elementWaitProps.elementEnabledCheckExclusionCmdsList) {
    newtimeouts.elementEnabledCheckExclusionCmdsList =
      elementWaitProps.elementEnabledCheckExclusionCmdsList;
  }

  newtimeouts.timeout = newtimeouts.timeout || defaultTimeOuts.timeout;
  newtimeouts.intervalBetweenAttempts =
    newtimeouts.intervalBetweenAttempts || defaultTimeOuts.intervalBetweenAttempts;
  newtimeouts.elementEnabledCheckExclusionCmdsList =
    newtimeouts.elementEnabledCheckExclusionCmdsList ||
    defaultTimeOuts.elementEnabledCheckExclusionCmdsList;

  map.set(session, newtimeouts);
  log.info(
    `Timeout properties set for session ${session} is ${JSON.stringify(_getTimeout(session))} ms`
  );
}
