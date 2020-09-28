import checkChildrenDatasets from "@modules/menu/checkChildrenDatasets.js";
import {expect} from "chai";
import {spy} from "sinon";


describe("checkChildrenDatasets", function () {
    /**
     * @param {boolean} hasChildren whether context should have children
     * @param {boolean} indicateDatasets whether children should hold datasets
     * @returns {object} context object for this describe
     */
    function createModel (hasChildren, indicateDatasets) {
        return {
            has: key => ({children: hasChildren})[key],
            get: key => ({children: hasChildren
                ? [{datasets: indicateDatasets}, {datasets: indicateDatasets}]
                : undefined})[key],
            set: spy()
        };
    }

    it("Should not change datasets field if no children exist", function () {
        const model = createModel(false);

        checkChildrenDatasets(model);

        expect(model.set.notCalled).to.be.true;
    });

    it("Should change datasets field if children exist and one child indicates datasets to show exist", function () {
        const model = createModel(true, true);

        checkChildrenDatasets(model);

        expect(model.set.calledOnce).to.be.true;
        expect(model.set.calledWithMatch({datasets: true}));
    });

    it("Should not change datasets field if children exist and no child indicates datasets to show exist", function () {
        const modelFalse = createModel(true, false),
            modelUndefined = createModel(true, undefined);

        checkChildrenDatasets(modelFalse);
        checkChildrenDatasets(modelUndefined);

        expect(modelFalse.set.notCalled).to.be.true;
        expect(modelUndefined.set.notCalled).to.be.true;
    });
});

