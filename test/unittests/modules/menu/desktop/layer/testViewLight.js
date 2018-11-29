import {expect} from "chai";
import LayerView from "@modules/menu/desktop/layer/viewLight.js";

describe("menu/desktop/layer/viewLight", function () {
    var fakeModel,
        CustomLayerView;

    before(function () {

        fakeModel = {
            getIsOutOfRange: function () {
                return 42;
            },

            isSettingVisible: false,
            isStyleable: false,
            showSettings: true,
            supported: ["2D"],

            setIsSettingVisible: function (value) {
                this.isSettingVisible = value;
            },

            setIsStyleable: function (value) {
                this.isStyleable = value;
            },

            get: function (value) {
                switch (value) {
                    case "isSettingVisible":
                        return this.isSettingVisible;
                    case "isStyleable":
                        return this.isStyleable;
                    case "showSettings":
                        return this.showSettings;
                    case "supported":
                        return this.supported;
                    default:
                        return null;
                }
            },

            has: function () {
                return true;
            },

            toJSON: function () {
                return {
                    styleable: this.isStyleable,
                    supported: this.supported,
                    isSettingVisible: this.isSettingVisible,
                    showSettings: this.showSettings,
                    transparency: 42,
                    isVisibleInMap: true
                };
            }
        };

        CustomLayerView = LayerView.extend({
            doGetParentObject: function () {
                return $("<div></div>");
            }
        });
    });

    describe("The style-icon", function () {
        it("should be visible for stylable layers", function () {
            var layerView;

            fakeModel.setIsStyleable(true);
            fakeModel.setIsSettingVisible(true);

            layerView = new CustomLayerView({model: fakeModel});

            expect(layerView.$el.find(".pull-right").find(".glyphicon-tint").length).to.be.equal(1);

            layerView.rerender();

            expect(layerView.$el.find(".pull-right").find(".glyphicon-tint").length).to.be.equal(1);
        });
        it("should be hidden for other not styleable layers", function () {
            var layerView;

            fakeModel.setIsStyleable(false);
            fakeModel.setIsSettingVisible(true);
            layerView = new CustomLayerView({model: fakeModel});
            expect(layerView.$el.find(".glyphicon-tint").length).to.be.equal(0);

            layerView.rerender();

            expect(layerView.$el.find(".glyphicon-tint").length).to.be.equal(0);
        });
    });
});
