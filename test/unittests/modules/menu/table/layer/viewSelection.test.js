import {expect} from "chai";
import SingleLayerView from "@modules/menu/table/layer/singleLayerView.js";

describe("menu/table/layer/singleLayerView", function () {
    var layerCollection,
        CustomLayerView;

    before(function () {
        layerCollection = new Backbone.Collection([
            {
                id: "713",
                isSelected: false,
                isSettingVisible: false,
                type: "Layer"
            },
            {
                id: "715",
                isSelected: false,
                isSettingVisible: false,
                type: "Layer"
            }
        ]);

        CustomLayerView = new SingleLayerView();
    });

    describe("The LayerSettings", function () {
        var settings, model, layers;

        it("should stay visible if corresponding Layer is switched on", function () {
            layerCollection.get("713").set("isSettingVisible", true);

            model = layerCollection.get("713");
            layers = layerCollection.where({type: "Layer"});
            settings = CustomLayerView.setSettingsVisibility(layers, model);

            expect(settings[0].get("isSettingVisible")).to.be.true;
        });

        it("should stay visible if corresponding Layer is switched off", function () {
            layerCollection.get("713").set("isSettingVisible", true);
            layerCollection.get("713").set("isSelected", true);

            model = layerCollection.get("713");
            layers = layerCollection.where({type: "Layer"});
            settings = CustomLayerView.setSettingsVisibility(layers, model);

            expect(settings[0].get("isSettingVisible")).to.be.true;
        });

        it("should hide if other Layer is switched on", function () {
            layerCollection.get("713").set("isSettingVisible", true);
            layerCollection.get("713").set("isSelected", true);

            model = layerCollection.get("715");
            layers = layerCollection.where({type: "Layer"});
            settings = CustomLayerView.setSettingsVisibility(layers, model);

            expect(settings[0].get("isSettingVisible")).to.be.false;
        });

        it("should not hide if other Layer is switched off", function () {
            layerCollection.get("713").set("isSettingVisible", true);
            layerCollection.get("715").set("isSelected", true);

            model = layerCollection.get("715");
            layers = layerCollection.where({type: "Layer"});
            settings = CustomLayerView.setSettingsVisibility(layers, model);

            expect(settings[0].get("isSettingVisible")).to.be.true;
        });

    });
});
