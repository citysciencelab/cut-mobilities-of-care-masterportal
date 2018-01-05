define(function(require) {
    var expect = require("chai").expect,
        Model = require("../../../../modules/vectorStyle/model.js"),
        Util = require("util");

    describe("vectorStyle", function () {
        var model,
            utilModel,
            features;

        before(function () {
            style = {
                layerId : "1711",
                class: "POINT",
                subClass : "SIMPLE",
                clusterImageName: "krankenhaus.png",
                imageName : "krankenhaus.png",
                imageScale : "0.7"
              },
            model = new Model({model:style});
            utilModel = new Util();
            features = utilModel.createTestFeatures();
        });

        describe("createStyle", function () {
            it("should return style if feature is undefined", function () {
                expect(model.createStyle(undefined, true)).not.to.be.undefined;
            });
        });
    });
});
