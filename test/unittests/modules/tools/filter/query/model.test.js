import Model from "@modules/tools/filter/query/model.js";
import {expect} from "chai";

describe("modules/tools/filter/query/model", function () {
    let model;
    const featureAttributesMap = [
            {
                "displayName": "Bezirk",
                "name": "bezirk",
                "snippetType": "dropdown",
                "type": "text",
                "values": ["Altona", "Bergedorf", "Eimsbüttel", "Hamburg-Mitte", "Hamburg-Nord", "Harburg", "Wandsbek"]
            },
            {
                "displayName": "Stadtteil",
                "name": "stadtteil",
                "snippetType": "dropdown",
                "type": "text",
                "values": ["Allermöhe", "Alsterdorf", "Altona-Altstadt", "Altona-Nord", "Bahrenfeld", "Barmbek-Nord"]
            },
            {
                "displayName": "Gemarkung",
                "name": "gemarkung",
                "snippetType": "dropdown",
                "type": "text",
                "values": ["Allermöhe", "Alt-Rahlstedt", "Altona-Nord", "Altona-Südwest", "Bahrenfeld", "Barmbek", "Bergedorf", "Bergstedt"]
            }
        ],
        rules = [
            {
                "attrName": "bezirk",
                "values": ["Altona"]
            }
        ];

    before(function () {
        model = new Model();
    });

    describe("mapRules", function () {
        it("should return an array", function () {
            const returnedFeatureAttributesMap = model.mapRules(featureAttributesMap, rules);

            expect(returnedFeatureAttributesMap).to.be.an("array");
        });

        it("should return an array with length three", function () {
            const returnedFeatureAttributesMap = model.mapRules(featureAttributesMap, rules);

            expect(returnedFeatureAttributesMap).to.have.lengthOf(3);
        });

        it("should have 'preselectedValues' with the value 'Altona'", function () {
            const returnedFeatureAttributesMap = model.mapRules(featureAttributesMap, rules);

            expect(returnedFeatureAttributesMap[0].preselectedValues).to.have.members(["Altona"]);
        });

        it("should be undefined for 'preselectedValues'", function () {
            const returnedFeatureAttributesMap = model.mapRules(featureAttributesMap, rules);

            expect(returnedFeatureAttributesMap[1].preselectedValues).to.be.an("undefined");
        });
    });

});
