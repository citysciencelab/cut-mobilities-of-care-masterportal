const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {getCenter} = require("../../../library/scripts"),
    {isCustom, isMaster, isMobile, isChrome} = require("../../../settings"),
    {By, Button, until} = webdriver;

/**
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function FreezeTests ({builder, url, resolution, browsername}) {
    const testIsApplicable = !isMobile(resolution) && // function not available mobile
        (isCustom(url) || isMaster(url)); // freeze only active in these

    if (testIsApplicable) {
        // TODO test is currently skipped; feature should only be tested in TO mode, for which tests will be implemented in a later iteration
        describe.skip("Modules Controls Freeze", function () {
            let driver, freezeView, freezeButton, unfreezeButton, topicButton, tree;

            before(async function () {
                driver = await initDriver(builder, url, resolution);

                await driver.wait(until.elementLocated(By.css(".freeze-view")), 50000);
                topicButton = await driver.findElement(By.linkText("Themen"));
                tree = await driver.findElement(By.id("tree"));
                topicButton.click(); // close tree for upcoming tests
            });

            after(async function () {
                await driver.quit();
            });

            it("should have the freeze-view element", async function () {
                freezeView = await driver.findElement(By.css(".freeze-view"));

                expect(freezeView).to.exist;
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

                expect(await driver.findElement(By.css(".freeze-view.freeze-deactivated"))).to.exist;
            });

            it("should prevent tool closing", async function () {
                await topicButton.click();
                expect(await tree.isDisplayed()).to.be.true;
                await driver.wait(until.elementIsVisible(driver.findElement(By.id("tree"))));
                await freezeButton.click();
                expect(await driver.findElement(By.css(".freeze-view.freeze-activated"))).to.exist;
                await freezeView.click();
                expect(await tree.isDisplayed()).to.be.true;
            });
        });
    }
}

module.exports = FreezeTests;
