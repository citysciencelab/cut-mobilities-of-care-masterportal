define(function(require) {
    var expect = require("chai").expect,
        UtilModel = require("../../../../../../modules/core/util.js"),
        StyleList = require("../../../../../../modules/vectorStyle/list.js"),
        ElasticLayerModel = require("../../../../../../modules/core/modelList/layer/elastic.js");

    describe("core/modelList/layer/elastic", function () {
        var elasticLayer,
            utilModel,
            styleList,
            styleModel;

        before(function () {
            elasticLayer = new ElasticLayerModel();
            utilModel = new UtilModel();
            styleList = new StyleList();
            styleModel = styleList.returnModelById("10319");
        });

        describe("setStyleFunction", function () {
            it("should return a function", function () {
                elasticLayer.setStyleFunction(styleModel);
                expect(elasticLayer.get("styleFunction")).to.be.a("function");

            });
            it("should return undefined and so the default style is used", function () {
                elasticLayer.setStyleFunction(undefined);
                expect(elasticLayer.get("styleFunction")).to.be.undefined;
            });
        });
    });
});
