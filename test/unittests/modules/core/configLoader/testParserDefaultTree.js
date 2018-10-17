import {expect} from "chai";
import DefaultTreeParser from "@modules/core/configLoader/parserDefaultTree.js";

describe("core/configLoader/parserDefaultTree", function () {
    var testLayerList;

    before(function () {

        // the test data has to consist of at least two layers of with the same "md_name" to trigger the creation of a folder
        testLayerList = [
            {
                "id": "683",
                "name": "Kindertagesstätten Details",
                "typ": "WMS",
                "datasets": [
                    {
                        "md_name": "testFolder",
                        "kategorie_opendata": [
                            "Sonstiges"
                        ],
                        "kategorie_inspire": [
                            "Versorgungswirtschaft und staatliche Dienste"
                        ],
                        "kategorie_organisation": "Behörde für Arbeit, Soziales, Familie und Integration"
                    }
                ]
            },
            {
                "id": "1933",
                "name": "Haltestellen",
                "typ": "WMS",
                "datasets": [
                    {
                        "md_name": "testFolder",
                        "kategorie_opendata": [
                            "Sonstiges"
                        ],
                        "kategorie_inspire": [
                            "nicht INSPIRE-identifiziert"
                        ],
                        "kategorie_organisation": "Hamburger Verkehrsverbund GmbH"
                    }
                ]
            }
        ];
    });

    // Create a model and parse the test data. Take care that the model is clean (empty) before parsing the data.
    function getDefaultModel (options) {
        var model = new DefaultTreeParser(options);

        model.setItemList([]);
        model.parseTree(testLayerList);
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
            expect(getDefaultModel({isFolderSelectable: true}).get("itemList")[0].folder.length).to.be.equal(1);
        });
    });
});
