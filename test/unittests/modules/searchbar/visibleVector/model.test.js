import Model from "@modules/searchbar/visibleVector/model.js";
import {expect} from "chai";
import Feature from "ol/Feature";

describe("modules/searchbar/visibleVector", function () {
    let model = {};

    const config = {
        "searchBar":
            {
                "visibleVector":
                {
                    "minChars": 3
                },
                "zoomLevel": 9,
                "placeholder": "Suche nach Adresse/Krankenhaus/B-Plan"
            }
    };

    before(function () {
        model = new Model(config);
    });

    describe("filterFeaturesArrayRec", function () {
        const features = [
            new Feature({
                schulname: "Grundschule Am Park"
            }),
            new Feature({
                schulname: "Stadtteilschule Am Hafen"
            }),
            new Feature({
                schulname: "Stadtteilschule Bergedorf"
            })
        ];

        it("should return the first Feature", function () {
            expect(model.filterFeaturesArrayRec(features, "schulname", "Am Park")).to.be.an("array").to.include(features[0]);
        });
        it("should return the third Feature", function () {
            expect(model.filterFeaturesArrayRec(features, "schulname", "berge")).to.be.an("array").to.include(features[2]);
        });
        it("should return all Features for empty searchstring input", function () {
            expect(model.filterFeaturesArrayRec(features, "schulname", "")).to.be.an("array").to.include.members([features[0], features[1], features[2]]);
        });
        it("should return an empty array for empty searchstring and searchField input", function () {
            expect(model.filterFeaturesArrayRec(features, "", "")).to.be.an("array").that.is.empty;
        });
    });
});
