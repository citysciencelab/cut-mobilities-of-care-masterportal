const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../../../../test/end2end/library/driver"),
    {getCenter} = require("../../../../../../test/end2end/library/scripts"),
    {isCustom, isMaster, isMobile, isChrome} = require("../../../../../../test/end2end/settings"),
    {logBrowserstackUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {By, Button} = webdriver;

/**
 * @param {Object} params e2eTestParams
 * @param {module:selenium-webdriver.Builder} params.builder the selenium.Builder object
 * @param {String} params.url the url to test
 * @param {String} params.resolution formatted as "AxB" with A, B integers
 * @param {String} params.browsername the name of the broser (to use chrome put "chrome" into the name)
 * @param {module:selenium-webdriver.Capabilities} param.capability sets the capability when requesting a new session - overwrites all previously set capabilities
 * @returns {void}
 */
function FreezeTests ({builder, url, resolution, browsername, capability}) {
    const testIsApplicable = !isMobile(resolution) && // function not available mobile
        (isCustom(url) || isMaster(url)); // freeze only active in these

    if (testIsApplicable) {
        describe("Modules Controls Freeze", function () {
            let driver, freezeButton, unfreezeButton, topicButton, tree;

            before(async function () {
                if (capability) {
                    capability.name = this.currentTest.fullTitle();
                    builder.withCapabilities(capability);
                }
                driver = await initDriver(builder, url, resolution);
                topicButton = await driver.findElement(By.css("#root .dropdown:first-child"));
                tree = await driver.findElement(By.id("tree"));
                topicButton.click(); // close tree for upcoming tests
            });

            after(async function () {
                if (capability) {
                    driver.session_.then(function (sessionData) {
                        logBrowserstackUrlToTest(sessionData.id_);
                    });
                }
                await driver.quit();
            });

            it("should have freeze button", async function () {
                freezeButton = await driver.findElement(By.css(".freeze-view-start"));

                expect(freezeButton).to.exist;
            });

            it("should activate the freeze-view element on clicking the freeze button", async function () {
                await freezeButton.click();

                expect(await driver.findElement(By.css(".freeze-view.freeze-activated"))).to.exist;
            });

            // canvas panning is currently broken in Chrome, see https://github.com/SeleniumHQ/selenium/issues/6332
            (isChrome(browsername) ? it.skip : it)("should prevent panning", async function () {
                const center = await driver.executeScript(getCenter),
                    viewport = await driver.findElement(By.css(".ol-viewport"));

                await driver.actions({bridge: true})
                    .move({origin: viewport})
                    .press(Button.LEFT)
                    .move({origin: viewport, x: 10, y: 10})
                    .release(Button.LEFT)
                    .perform();

                /* artificially wait some time to pretend we're waiting on a move-end;
                * can't use "await driver.executeAsyncScript(onMoveEnd);" since no move is expected at all;
                * if we directly checked the coordinate, it's guaranteed it wouldn't've changed yet,
                * even if currently an animation happens */
                await new Promise(resolve => setTimeout(resolve, 1000));

                expect(center).to.eql(await driver.executeScript(getCenter));
            });

            it("should prevent tool opening", async function () {
                expect(topicButton.click).to.throw();
                expect(tree.isDisplayed).to.throw();
            });

            it("should have an unfreeze button when active", async function () {
                unfreezeButton = await driver.findElement(By.css(".freeze-view-close"));

                expect(unfreezeButton).to.exist;
            });

            it("should deactivate the freeze element on clicking the unfreeze button", async function () {
                await unfreezeButton.click();

                expect(await driver.findElements(By.css(".freeze-view"))).to.have.lengthOf(0);
            });
        });
    }
}

module.exports = FreezeTests;
