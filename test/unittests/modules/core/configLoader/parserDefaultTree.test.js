import DefaultTreeParser from "@modules/core/configLoader/parserDefaultTree.js";
import testServices from "../../../resources/testServices.json";
// import Collection from "@modules/core/rawLayerList.js";
// import {initializeLayerList} from "masterportalAPI/src/rawLayerList";
import {expect} from "chai";

describe("core/configLoader/parserDefaultTree", function () {

    // Create a model and parse the test data. Take care that the model is clean (empty) before parsing the data.
    /**
     * Helper function to getb the default model.
     * @param {Object} options Options.
     * @returns {Backbone.Model} - Model.
     */
    function getDefaultModel (options) {
        var model = new DefaultTreeParser(options);

        model.setItemList([]);
        model.parseTree(testServices);

        return model;
    }

    describe("the \"select all\" checkbox", function () {

        it("should be visible if global-isFolderSelectable is true", function () {
            expect(_.findWhere(getDefaultModel({isFolderSelectable: true}).get("itemList"), {"name": "testFolder"}).isFolderSelectable).to.be.equal(true);
        });
        it("should be hidden if global-isFolderSelectable is false", function () {
            expect(_.findWhere(getDefaultModel({isFolderSelectable: false}).get("itemList"), {"name": "testFolder"}).isFolderSelectable).to.be.equal(false);
        });
    });

    describe("the number of folders within the test data", function () {
        it("should be one", function () {
            expect(_.where(getDefaultModel({isFolderSelectable: false}).get("itemList"), {"name": "testFolder"}).length).to.be.equal(1);
        });
    });
});
