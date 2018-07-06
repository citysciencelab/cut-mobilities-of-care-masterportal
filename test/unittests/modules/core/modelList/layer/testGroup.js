define(function (require) {
    var expect = require("chai").expect,
        GroupLayerModel = require("../../../../../../modules/core/modelList/layer/group.js");

    describe("core/modelList/layer/group", function () {
        var groupLayer,
            layerdefinitions = [{
                "id": "2802",
                "name": "Jahrgang 2015",
                "url": "https://geodienste.hamburg.de/HH_WMS_Historische_Karte_1_5000",
                "typ": "WMS",
                "layers": "62",
                "version": "1.3.0",
                "minScale": "0",
                "maxScale": "2500000",
                "gfiAttributes": "ignore"
            }, {
                "id": "2803",
                "name": "Footprint",
                "url": "https://geodienste.hamburg.de/HH_WMS_Historische_Karte_1_5000",
                "typ": "WMS",
                "layers": "63",
                "version": "1.3.0",
                "minScale": "0",
                "maxScale": "2500000",
                "gfiAttributes": "showAll"
            }
            ];

        before(function () {
            groupLayer = new GroupLayerModel();
        });

        describe("groupGfiAttributes", function () {
            it("should return a string with both gfiAttributes of groupedLayers if gfiAttributes of groupLayer is undefined", function () {
                expect(groupLayer.groupGfiAttributes(undefined, layerdefinitions)).to.have.string("ignore,showAll");
            });
            it("should return a string with gfiAttribute of groupLayer (String)", function () {
                expect(groupLayer.groupGfiAttributes("showAll", layerdefinitions)).to.have.string("showAll");
            });
            it("should return an object with gfiAttributes of groupLayer (Object)", function () {
                expect(groupLayer.groupGfiAttributes({"test1": "TEST1", "test2": "TEST2"}, layerdefinitions)).to.deep.include({test1: "TEST1", test2: "TEST2"});
            });
        });
        describe("groupLayerObjectsByUrl", function () {
            it("should return 2 layerdefinitions when gfiAttributes is not set on groupLayer", function () {
                expect(groupLayer.groupLayerObjectsByUrl(layerdefinitions)).to.be.an("array").that.has.lengthOf(2);
            });
            it("should return 1 layerdefinitions when gfiAttributes is set on groupLayer", function () {
                groupLayer.set("gfiAttributes", "showAll");
                expect(groupLayer.groupLayerObjectsByUrl(layerdefinitions)).to.be.an("array").that.has.lengthOf(1);
            });
        });
    });
});
