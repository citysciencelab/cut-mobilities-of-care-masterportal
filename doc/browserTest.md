# Browser testing with Selenium WebDriver

## Install browser test drivers (WebDrivers)

   To locally run the browser tests, drivers have to be installed on your system. At least *chromedriver* should be installed, but you may also install further drivers for test automation. (Hint: For Firefox, the name of the WebDriver is *geckodriver*.)

   Using the variable "browser" (see below), these browsers can be used for automated tests::
   - "chrome": Chrome-Browser
   - "firefox": Firefox
   - "ie": Internet Explorer
   - "bs": arbitrary browsers at BrowserStack.com

   For installation, [download the required drivers](https://docs.seleniumhq.org/download/) and make them available to the system environment. On Windows, this is done by adding the driver's paths to the `path` variable in your system environment variables. The `.exe` file must have been placed in a folder where `.exe` files are allowed to be executed.

   To test your setup, open a new `cmd` terminal (no administrative rights required) and run e.g. `chromedriver`. This should print *"ChromeDriver was started successfully."*, or any other confirmation, depending on the driver you're testing.

## Locally run tests

To locally run the tests, a Masterportal dev server has to be started. Run `npm start` to do so. Then, run `npm run browsertest` to execute the tests.

You may also start a run with modified parameters to e.g. use your local proxy, set the browser to test, or change the URL the portal is running on.

```console
$ browser=firefox url=[url] proxy=[proxyurl] ./node_modules/.bin/mocha ./test/end2end/TestRunner.js
```

You may also define the variables for your test environment by creating a file `.env` in the Masterportal root, containing your variables. The file will be read on each test run.

## Run tests on BrowserStack.com

You may also run the start script to execute the tests directly on BrowserStack.

```console
$ browser=bs bs_user=[browserstackusername] bs_key=[browserstackkey] url=[url] proxy=[proxyurl] ./node_modules/.bin/mocha ./test/end2end/TestRunner.js
```

To run the local system's tests on BrowserStack, you need to run a BrowserStack script locally before starting the test procedure. See [local testing on BrowserStack](https://www.browserstack.com/local-testing#command-line).

```console
$ BrowserStackLocal.exe --key [browserstackkey] --proxy-host [proxyurl] --proxy-port [proxyport]
```
