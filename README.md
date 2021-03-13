# appium-wait-plugin

This is an Appium plugin designed to wait for element to be present.

## Prerequisite

Appium version 2.0

## Installation - Server

Install the plugin using Appium's plugin CLI, either as a named plugin or via NPM:

```
appium plugin install element-wait
appium plugin install --source=npm appium-element-wait
```

## Installation - Client

No special action is needed to make things work on the client side.

## Activation

The plugin will not be active unless turned on when invoking the Appium server:

```
appium --plugins=element-wait
```

## Configuration

To override the default element-wait retry set `capabilities.setCapability("appium:element-wait", 20);`. Default value is 30.

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

Server logs will be as below:

```
[Appium] Plugin element-wait (sessionless) is now handling cmd 'findElement'
[Plugin [element-wait (sessionless)]] Retrying to find element with accessibility id strategy for login selector
[Plugin [element-wait (sessionless)]] Retrying to find element with accessibility id strategy for login selector
[Plugin [element-wait (sessionless)]] Retrying to find element with accessibility id strategy for login selector
[Plugin [element-wait (sessionless)]] Element with accessibility id strategy for login selector found.
[Plugin [element-wait (sessionless)]] Checking if login element is displayed
[Plugin [element-wait (sessionless)]] login element is displayed.
```
