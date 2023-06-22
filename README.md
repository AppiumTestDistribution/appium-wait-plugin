# appium-wait-plugin [![npm version](https://badge.fury.io/js/appium-wait-plugin.svg)](https://badge.fury.io/js/appium-wait-plugin)

<h1 align="center">
	<br>
	<img src="images/AppiumWait2.gif" alt="AppiumWait2">
	<br>
	<br>
	<br>
</h1>
This is an Appium plugin designed to wait for element to be present.

## Prerequisite

Appium version 2.0

Tested with appium v2.0.0-beta.42

### From Verion 2.0.0 
* Following bindings are not supported 
        - `sessionId/waitplugin/timeout`
        - `sessionId/waitplugin/getTimeout`
* Following command are renamed 
        - `plugin: getWaitTimeout` is renamed to `plugin: getWaitPluginProperties`
        - `plugin: getWaitTimeout` is renamed to `plugin: setWaitPluginProperties`


## Installation - Server

Install the plugin using Appium's plugin CLI, either as a named plugin or via NPM:

```
appium plugin install --source=npm appium-wait-plugin
```

## Installation - Client

No special action is needed to make things work on the client side.

## Activation

The plugin will not be active unless turned on when invoking the Appium server:

```
appium --use-plugins=element-wait
```

## Configuration

To override the default element-wait retry
1. Use appium server CLI
	--plugin-element-wait-timeout=30000
	--plugin-element-wait-interval-between-attempts=200 
	--plugin-element-wait-exclude-enabled-check="click,clear"
	

2. Use appium server config file. [Refer](https://github.com/AppiumTestDistribution/appium-wait-plugin/blob/main/server-config.json). 
### Example


Before wait-plugin 

```
wait = new WebDriverWait(driver, 30);
wait.until(presenceOfElementLocated(MobileBy.AccessibilityId("login"))).click();
wait.until(presenceOfElementLocated(MobileBy.AccessibilityId("slider1")));
driver.findElementByAccessibilityId("slider1").click();
WebElement slider = wait.until(presenceOfElementLocated(MobileBy.AccessibilityId("slider")));
WebElement slider1 = wait.until(presenceOfElementLocated(MobileBy.AccessibilityId("slider1")));
```


After wait-plugin 

```
driver.findElementByAccessibilityId("login").click();
driver.findElementByAccessibilityId("slider1").click();
driver.findElementByAccessibilityId("login").sendKeys('Hello');
```
## Configure Wait timeout in test

While overriding timeouts one can choose to override all or one of the below
* timeout
* intervalBetweenAttempts

WDIO Example 

```
await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          timeout: 1111,
          intervalBetweenAttempts: 11,
        },
]);

await driver.executeScript('plugin: getWaitPluginProperties', [])
```
or 
```
await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          timeout: 1111,
        },
]);

await driver.executeScript('plugin: getWaitPluginProperties', [])
```

Java Example 

```
driver.executeScript("plugin: setWaitPluginProperties", ImmutableMap.of("timeout", 1111 , "intervalBetweenAttempts", 11 ));
```

Server logs will be as below:

```
[Appium] Plugins which can handle cmd 'findElement': element-wait (sessionless)
[Appium] Plugin element-wait (sessionless) is now handling cmd 'findElement'
[Plugin [element-wait (sessionless)]] Waiting to find element with accessibility id strategy for login selector
[Plugin [element-wait (sessionless)]] Waiting to find element with accessibility id strategy for login selector
[Plugin [element-wait (sessionless)]] Waiting to find element with accessibility id strategy for login selector
[Plugin [element-wait (sessionless)]] Waiting to find element with accessibility id strategy for login selector
[Plugin [element-wait (sessionless)]] Element with accessibility id strategy for login selector found.
[Plugin [element-wait (sessionless)]] Checking if login element is displayed
[Plugin [element-wait (sessionless)]] login element is displayed.
```

## Skip element Enabled Check for commands
Before performing actions such as `click`, `setValue`, `clear` etc, plugin waits for element to be enabled.
As mentioned in [#78](https://github.com/AppiumTestDistribution/appium-wait-plugin/issues/78) if there is a need to skip the `elementEnabled` check for a set of commands, `excludeEnabledCheck` can be sent along with timeout values. 
##### Usage
wdio
```
await driver.executeScript('plugin: setWaitPluginProperties', [
        {
          timeout: 1111,
          intervalBetweenAttempts: 11,
	  excludeEnabledCheck: ['click','setValue']
        },
]);

await driver.executeScript('plugin: getWaitPluginProperties', [])
```

By default `excludeEnabledCheck` is empty list.