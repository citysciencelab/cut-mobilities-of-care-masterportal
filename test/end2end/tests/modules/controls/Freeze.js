// 2.8. (23, MO) Ansicht sperren
// 2.8.1 Button auf rechter Seite mit “Ansicht sperren” klicken (3h)
// -> Grauer Button mit “Ansicht entsperren” wird eingeblendet
// -> Die Karte lässt sich nicht mehr bewegen
// -> Controls, Suchleiste, Werkzeuge und andere Element in der Themenleiste lassen sich nicht benutzen
// 2.8.1 Klick auf den grauen Button “Ansicht entsperren” (1h)
// -> Controls, Suchleiste, Werkzeuge und andere Element in der Themenleiste lassen sich wieder benutzen
// -> Der graue Button mit “Ansicht entsperren” wird ausgeblendet

const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {getCenter} = require("../../../library/scripts"),
    {isCustom, isMobile} = require("../../../settings"),
    {By, Button, until} = webdriver;

/**
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function FreezeTests ({builder, url, resolution, browsername}) {
    const skipAll = isMobile(resolution) // function not available mobile
        || !isCustom(url), // freeze only active in custom
        // canvas panning is currently broken in Chrome, see https://github.com/SeleniumHQ/selenium/issues/6332
        skipPanning = browsername.toLowerCase().includes("chrome");

    (skipAll ? describe.skip : describe)("Modules Controls Freeze", function () {
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

        (skipPanning ? it.skip : it)("should prevent panning", async function () {
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

module.exports = FreezeTests;
