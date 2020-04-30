import CustomTreeParser from "@modules/core/configLoader/parserCustomTree.js";
import {expect} from "chai";
import Util from "@modules/core/util.js";

describe("core/configLoader/parserCustomTree", function () {
    let testData;

    before(function () {
        new Util();
        testData = {
            "Fachdaten": {
                "Ordner": [
                    {
                        "Titel": "Denkmalschutz",
                        "isFolderSelectable": true
                    },
                    {
                        "Titel": "Hochwasserschutz",
                        "isFolderSelectable": false
                    },
                    {
                        "Titel": "Eisenbahnwesen / Personenbeförderung",
                        "Ordner": [
                            {
                                "Titel": "Hamburger Verkehrsverbund (HVV)"
                            }
                        ]
                    }
                ]
            }
        };
    });

    // Create a model and parse the test data. Take care that the model is clean (empty) before parsing the data.
    /**
     *
     * get the custome model
     * @param {array} options - the model options
     * @returns {object} the model
     */
    function getCustomModel (options) {
        const model = new CustomTreeParser(options);

        model.setItemList([]);
        model.parseTree(testData.Fachdaten);
        return model;
    }

    describe("the \"select all\" checkbox", function () {
        it("should be visible if item-isFolderSelectable is true and global-isFolderSelectable is true", function () {
            expect(Radio.request("Util", "findWhereJs", getCustomModel({isFolderSelectable: true}).get("itemList"), {"name": "Denkmalschutz"}).isFolderSelectable).to.be.equal(true);
        });
        it("should be visible if item-isFolderSelectable is true and global-isFolderSelectable is false", function () {
            expect(Radio.request("Util", "findWhereJs", getCustomModel({isFolderSelectable: false}).get("itemList"), {"name": "Denkmalschutz"}).isFolderSelectable).to.be.equal(true);
        });
        it("should be hidden if item-isFolderSelectable is false and global-isFolderSelectable is true", function () {
            expect(Radio.request("Util", "findWhereJs", getCustomModel({isFolderSelectable: true}).get("itemList"), {"name": "Hochwasserschutz"}).isFolderSelectable).to.be.equal(false);
        });
        it("should be false if item-isFolderSelectable is false and global-isFolderSelectable is false", function () {
            expect(Radio.request("Util", "findWhereJs", getCustomModel({isFolderSelectable: false}).get("itemList"), {"name": "Hochwasserschutz"}).isFolderSelectable).to.be.equal(false);
        });
        it("should be visible if item-isFolderSelectable is undefined and global-isFolderSelectable is true", function () {
            expect(Radio.request("Util", "findWhereJs", getCustomModel({isFolderSelectable: true}).get("itemList"), {"name": "Hamburger Verkehrsverbund (HVV)"}).isFolderSelectable).to.be.equal(true);
        });
        it("should be hidden if item-isFolderSelectable is undefined and global-isFolderSelectable is false", function () {
            expect(Radio.request("Util", "findWhereJs", getCustomModel({isFolderSelectable: false}).get("itemList"), {"name": "Hamburger Verkehrsverbund (HVV)"}).isFolderSelectable).to.be.equal(false);
        });
    });

    describe("the number of items (folders) within the test data", function () {
        it("should be four", function () {
            expect(getCustomModel({isFolderSelectable: true}).get("itemList").length).to.be.equal(4);
        });
    });

    describe("the flag \"isLeafFolder\"", function () {
        it("should be set to \"true\", if the folder has no child-folders", function () {
            expect(Radio.request("Util", "findWhereJs", getCustomModel({isFolderSelectable: true}).get("itemList"), {"name": "Denkmalschutz"}).isLeafFolder).to.be.equal(true);
        });
        it("should be set to \"false\", if the folder has no child-folders", function () {
            expect(Radio.request("Util", "findWhereJs", getCustomModel({isFolderSelectable: true}).get("itemList"), {"name": "Eisenbahnwesen / Personenbeförderung"}).isLeafFolder).to.be.equal(false);
        });
    });
});
