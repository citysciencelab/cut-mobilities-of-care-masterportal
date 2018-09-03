define(function (require) {
    var expect = require("chai").expect,
        $ = require("jquery"),
        LayerView = require("../../../../../../modules/menu/desktop/layer/viewSelection.js");

    describe("menu/desktop/layer/viewSelection", function () {
        var fakeModel,
            CustomLayerView;

        before(function () {

            fakeModel = {
                getIsOutOfRange: function () {
                    return 42;
                },

                isSettingVisible: false,
                isStyleable: false,

                setIsSettingVisible: function (value) {
                    this.isSettingVisible = value;
                },

                get: function (value) {
                    switch (value) {
                        case "isSettingVisible":
                            return this.isSettingVisible;
                        case "isStyleable":
                            return this.isStyleable;
                        default:
                            return null;
                    }
                },

                setIsStyleable: function (value) {
                    this.isStyleable = value;
                },

                has: function () {
                    return true;
                },

                toJSON: function () {
                    return {
                        styleable: this.isStyleable,
                        isSettingVisible: this.isSettingVisible,
                        transparency: 42,
                        isVisibleInMap: true
                    };
                }
            };

            CustomLayerView = LayerView.extend({
                doGetSelectedLayerObject: function () {
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
});
