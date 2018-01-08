define(function(require) {
    var expect = require("chai").expect,
        Model = require("../../../../modules/vectorStyle/model.js"),
        Util = require("util");

    describe("vectorStyle", function () {
        var model,
            utilModel,
            features,
            simplePointStyle = {
                layerId : "1711",
                class: "POINT",
                subClass : "SIMPLE",
                clusterImageName: "krankenhaus.png",
                imageName : "krankenhaus.png",
                imageScale : "0.7"
            },
            customPointStyle = {
                layerId : "1711",
                class: "POINT",
                subClass : "CUSTOM",
                styleField: "",
                styleFieldValues: [
                    {
                        styleFieldValue: "TESTTEST",
                        imageName: "krankenhaus.png"
                    }
                ]
            },
            wrongClassStyle = {
                layerId : "1711",
                class: "POINT_WRONG",
                subClass : "SIMPLE",
                clusterImageName: "krankenhaus.png",
                imageName : "krankenhaus.png",
                imageScale : "0.7"
            },
            wrongSubClassStyle = {
                layerId : "1711",
                class: "POINT",
                subClass : "SIMPLE_",
                clusterImageName: "krankenhaus.png",
                imageName : "krankenhaus.png",
                imageScale : "0.7"
            };

        before(function () {
            utilModel = new Util();
            features = utilModel.createTestFeatures();
        });

        describe("createStyle", function () {
            it("should return style (!undefined) if feature is undefined and not clustered", function () {
                model = new Model(simplePointStyle);
                expect(model.createStyle(undefined, false)).not.to.be.undefined;
            });
            it("should return style (!undefined) if styleField and StyleFieldValues[0] do not match", function () {
                model = new Model(customPointStyle);
                expect(model.createStyle(features[0], false)).not.to.be.undefined;
            });
            it("should return undefined if class !== \"POINT\" || \"POLYGON\" || \"LINE\"", function () {
                model = new Model(wrongClassStyle);
                expect(model.createStyle(features[0], false)).to.be.undefined;
            });
            it("should return undefined if subClass !== \"SIMPLE\" || \"CUSTOM\" || \"CIRCLE\"", function () {
                model = new Model(wrongSubClassStyle);
                expect(model.createStyle(features[0], false)).to.be.undefined;
            });
        });
    });
});
