import {expect} from "chai";
import DefaultTreeParser from "@modules/core/configLoader/parserDefaultTree.js";
import testServices from "../../../resources/testServices.json";
import Collection from "@modules/core/rawLayerList.js";

describe("core/configLoader/parserDefaultTree", function () {
    before(function () {
        new Collection(null, {url: "resources/testServices.json"});
        // the test data has to consist of at least two layers of with the same "md_name" to trigger the creation of a folder
    });

    // Create a model and parse the test data. Take care that the model is clean (empty) before parsing the data.
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
