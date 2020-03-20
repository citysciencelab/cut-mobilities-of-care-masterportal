import Model from "@modules/searchbar/tree/model.js";
import {expect} from "chai";

describe("modules/searchbar/tree", function () {
    const config = {
        "searchBar": {
            "tree": {
                "minChars": 3
            },
            "zoomLevel": 9,
            "placeholder": "Suche nach Adresse/Krankenhaus/B-Plan"
        }
    };
    let model = {};

    before(function () {
        model = new Model(config);
    });

    describe("getUniqeLayermodels", function () {
        const layerModels = [
            {
                id: 1,
                name: "aa",
                test: 11
            },
            {
                id: 1,
                name: "aa",
                test: 22
            },
            {
                id: 2,
                name: "bb",
                test: 33
            }
        ];

        it("Should be an empty array by empty array input", function () {
            expect(model.getUniqeLayermodels([])).to.be.an("array").that.is.empty;
        });
        it("Should be an empty array by undefined input", function () {
            expect(model.getUniqeLayermodels(undefined)).to.be.an("array").that.is.empty;
        });
        it("Should be an unique array that not includes the duplicates by name and id", function () {
            expect(model.getUniqeLayermodels(layerModels)).to.be.an("array").to.not.include(
                {
                    id: 1,
                    name: "aa",
                    test: 22
                }
            );
        });
    });

    describe("getLayerForSearch", function () {
        const layerModelsUniqe = [
            {
                id: 1,
                name: "aa",
                test: 11
            },
            {
                id: 2,
                name: "bb",
                test: 33
            }
        ];

        it("Should be an empty array by empty array input", function () {
            expect(model.getLayerForSearch([])).to.be.an("array").that.is.empty;
        });
        it("Should be an empty array by undefined input", function () {
            expect(model.getLayerForSearch(undefined)).to.be.an("array").that.is.empty;
        });
        it("Should be an unique array by id and name are the same properties", function () {
            expect(model.getLayerForSearch(layerModelsUniqe)).to.be.an("array").to.deep.include(
                {
                    name: "aa",
                    metaName: "aa",
                    type: i18next.t("common:modules.searchbar.type.topic"),
                    glyphicon: "glyphicon-list",
                    id: 1
                },
                {
                    name: "bb",
                    metaName: "bb",
                    type: i18next.t("common:modules.searchbar.type.topic"),
                    glyphicon: "glyphicon-list",
                    id: 2
                }
            );
        });
    });
});
