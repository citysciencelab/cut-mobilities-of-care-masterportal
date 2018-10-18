import {expect} from "chai";
import Model from "@modules/tools/compareFeatures/model.js";
import Util from "../../../Util";

describe("tools/compareFeatures", function () {
    var model,
        utilModel,
        gfiAttributes,
        themeConfig,
        testFeatures;

    before(function () {
        model = new Model({layerId: "1711"});
        utilModel = new Util();
        testFeatures = utilModel.createTestFeatures("resources/testFeaturesSchulen.xml");
        testFeatures.forEach(function (feature, index) {
            feature.set("layerId", "1711");
            feature.set("layerName", "Krankenhäuser");
            feature.setId("id_" + index);
        });
        testFeatures[4].set("layerId", "1234");
        testFeatures[5].set("layerId", "1234");
        gfiAttributes = {
            "abschluss": "Abschluss",
            "adresse_ort": "Ort",
            "adresse_strasse_hausnr": "Straße",
            "bezirk": "Bezirk"
        };
        themeConfig = [{
            name: "Grundsätzliche Informationen",
            isSelected: true,
            attributes: [
                "adresse_strasse_hausnr",
                "adresse_ort",
                "bezirk"]
        },
        {
            name: "Abschlüsse",
            attributes: ["abschluss"]
        }];
    });

    describe("isFeatureListFull", function () {
        it("should return false if there is only one feature per layer in the list", function () {
            model.addFeatureToList(testFeatures[0]);
            expect(model.isFeatureListFull(testFeatures[0].get("layerId"), model.get("groupedFeatureList"), model.get("numberOfFeaturesToShow"))).to.be.false;
        });
        it("should return true if there are already three features per layer in the list", function () {
            model.addFeatureToList(testFeatures[1]);
            model.addFeatureToList(testFeatures[2]);
            model.addFeatureToList(testFeatures[4]);
            expect(model.isFeatureListFull(testFeatures[3].get("layerId"), model.get("groupedFeatureList"), model.get("numberOfFeaturesToShow"))).to.be.true;
        });
    });

    describe("groupedFeaturesBy", function () {
        it("should return an object with the keys '1711' and '1234'", function () {
            var groupedFeatures = model.groupedFeaturesBy(model.get("featureList"), "layerId");

            expect(groupedFeatures).to.have.all.key("1711", "1234");
        });
        it("should return an array with a length of three for features with layer id 1711", function () {
            expect(model.get("groupedFeatureList")["1711"]).to.have.lengthOf(3);
        });
        it("should return an array with a length of one for features with layer id 1234", function () {
            expect(model.get("groupedFeatureList")["1234"]).to.have.lengthOf(1);
        });
    });

    describe("setFeatureIsOnCompareList", function () {
        it("should be on the compare list", function () {
            model.setFeatureIsOnCompareList(testFeatures[0], true);
            expect(testFeatures[0].get("isOnCompareList")).to.be.true;
        });
        it("should be on the compare list", function () {
            model.setFeatureIsOnCompareList(testFeatures[1], false);
            expect(testFeatures[1].get("isOnCompareList")).to.be.false;
        });
    });

    describe("removeFeatureFromList", function () {
        it("should expect a feature list of three features", function () {
            model.removeFeatureFromList(testFeatures[4]);
            expect(model.get("featureList")).to.have.lengthOf(3);
        });
        it("should expect a feature list of three features", function () {
            model.removeFeatureFromList(testFeatures[4]);
            expect(model.get("featureList")).to.have.lengthOf(3);
        });
        it("should expect a feature list of two features", function () {
            model.removeFeatureFromList(testFeatures[2]);
            expect(model.get("featureList")).to.have.lengthOf(2);
        });
    });

    describe("addFeatureToList", function () {
        it("should expect a feature list of two features", function () {
            model.addFeatureToList(testFeatures[2]);
            expect(model.get("featureList")).to.have.lengthOf(3);
        });
        it("should expect a feature list of three features", function () {
            model.addFeatureToList(testFeatures[4]);
            expect(model.get("featureList")).to.have.lengthOf(4);
        });
    });

    describe("beautifyAttributeValues", function () {
        it("expects an array with four value for the attribute 'kernzeitbetreuung'", function () {
            model.beautifyAttributeValues(testFeatures[3]);
            expect(testFeatures[3].get("kernzeitbetreuung")).to.be.an("array").to.have.lengthOf(4);
        });
    });

    describe("prepareFeatureListToShow", function () {
        it("expects an array with a length of four", function () {
            expect(model.prepareFeatureListToShow(gfiAttributes, themeConfig)).to.be.an("array").to.have.lengthOf(4);
        });
        it("expects an object with the attribute keys 'col-1' and 'col-2'", function () {
            expect(model.prepareFeatureListToShow(gfiAttributes, themeConfig)[1]).to.have.all.key("col-1", "col-2");
        });
    });

    describe("getLayerSelection", function () {
        it("expects an array with a length of two", function () {
            expect(model.getLayerSelection(model.get("groupedFeatureList"))).to.be.an("array").to.have.lengthOf(2);
        });
        it("expects an object with the keys 'id' and 'name'", function () {
            expect(model.getLayerSelection(model.get("groupedFeatureList"))[0]).to.have.deep.keys("id", "name");
        });
    });

    describe("getFeatureIds", function () {
        it("expects an array with a length of three for the layer with the id '1711", function () {
            expect(model.getFeatureIds(model.get("groupedFeatureList"), "1711")).to.be.an("array").to.have.lengthOf(3);
        });
        it("expects an array with a length of one for the layer with the id '1234", function () {
            expect(model.getFeatureIds(model.get("groupedFeatureList"), "1234")).to.be.an("array").to.have.lengthOf(1);
        });
        it("expects an array with the values 'id_0', 'id_1', 'id_2' for the layer with the id '1711'", function () {
            expect(model.getFeatureIds(model.get("groupedFeatureList"), "1711")).to.have.members(["id_0", "id_1", "id_2"]);
        });
        it("expects an array with the values 'id_4' for the layer with the id '1234'", function () {
            expect(model.getFeatureIds(model.get("groupedFeatureList"), "1234")).to.have.members(["id_4"]);
        });
    });
});
