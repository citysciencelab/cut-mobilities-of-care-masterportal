import Model from "@modules/tools/pendler/core/model.js";
import {expect} from "chai";

let model;

describe("modules/tools/pendler/core/model.js", () => {
    beforeEach(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
        model = new Model();
    });

    describe("getMaximumExtentOfGroupOfExtents", () => {
        it("should return null in case no extent was found in the given features", () => {
            expect(model.getMaximumExtentOfGroupOfExtents(undefined)).to.be.null;
            expect(model.getMaximumExtentOfGroupOfExtents(null)).to.be.null;
            expect(model.getMaximumExtentOfGroupOfExtents("string")).to.be.null;
            expect(model.getMaximumExtentOfGroupOfExtents(1234)).to.be.null;
            expect(model.getMaximumExtentOfGroupOfExtents(false)).to.be.null;
            expect(model.getMaximumExtentOfGroupOfExtents(true)).to.be.null;
            expect(model.getMaximumExtentOfGroupOfExtents([])).to.be.null;
            expect(model.getMaximumExtentOfGroupOfExtents({})).to.be.null;
        });
        it("should create the maximum extent from a number of features", () => {
            const extents = [
                    [-10, 0, 0, 0],
                    [0, -20, 0, 0],
                    [0, 0, 10, 0],
                    [0, 0, 0, 20]
                ],
                expected = [-10, -20, 10, 20],
                result = model.getMaximumExtentOfGroupOfExtents(extents);

            expect(result).to.deep.equal(expected);
        });
        it("test createAlertBeforeDownload properties", () => {
            const expected = {
                    category: "common:modules.alerting.categories.warning",
                    confirmText: "common:button.download",
                    content: "modules.tools.pendler.general.attributionText",
                    displayClass: "warning",
                    mustBeConfirmed: true
                },
                result = model.getDownloadAlertProperties();

            expect(result.category).to.deep.equal(expected.category);
            expect(result.confirmText).to.deep.equal(expected.confirmText);
            expect(result.content).to.deep.equal(expected.content);
            expect(result.displayClass).to.deep.equal(expected.displayClass);
            expect(result.mustBeConfirmed).to.deep.equal(expected.mustBeConfirmed);
            expect(typeof result.legacy_onConfirm).to.be.equals("function");
        });
    });
});
