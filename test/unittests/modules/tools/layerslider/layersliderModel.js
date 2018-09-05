define(function (require) {
    var expect = require("chai").expect,
        Model = require("../../../../../modules/tools/layerslider/model.js");

    describe("modules/layerslider", function () {
        var model,
            layerIds = [
                {
                    "title": "Dienst 1",
                    "layerId": "8730"
                },
                {
                    "title": "Dienst 2",
                    "layerId": "2426"
                },
                {
                    "title": "Dienst 3",
                    "layerId": "4561"
                },
                {
                    "title": "Dienst 4",
                    "layerId": "4567"
                },
                {
                    "title": "Dienst 5",
                    "layerId": "4568"
                }
            ];

        before(function () {
            model = new Model({layerIds: layerIds, title: "Test", timeInterval: 500});
        });

        describe("creates correct width for progress bar", function () {
            it("should return min width", function () {
                model.setProgressBarWidth(_.range(100));
                expect(model.get("progressBarWidth")).to.equal(10);
            });
            it("should return average width", function () {
                model.setProgressBarWidth(_.range(3));
                expect(model.get("progressBarWidth")).to.equal(33);
            });
        });

        describe("gets correct layer infos", function () {
            it("should return layer 4561", function () {
                model.setLayerIds(layerIds);
                model.setActiveIndex(2);
                expect(model.get("activeLayer")).to.deep.equal({
                    "title": "Dienst 3",
                    "layerId": "4561"
                });
            });
            it("should return layer 4568", function () {
                model.setActiveIndex(4);
                expect(model.get("activeLayer")).to.deep.equal({
                    "title": "Dienst 5",
                    "layerId": "4568"
                });
            });
        });

        describe("creates and removes windows interval", function () {
            function hello () {
                console.warn("hello world");
            }
            it("should setInterval", function () {
                model.setWindowsInterval(hello, 500);
                expect(model.get("windowsInterval")).not.to.be.null;
            });
            it("should clearInterval", function () {
                model.stopInterval();
                expect(model.get("windowsInterval")).to.to.be.null;
            });
        });

        describe("switches layer in array", function () {
            it("should go forwards", function () {
                model.setLayerIds(layerIds);
                model.setActiveIndex(0);
                model.forwardLayer();
                expect(model.get("activeLayer")).to.deep.equal({
                    "title": "Dienst 2",
                    "layerId": "2426"
                });
            });
            it("should go backwards", function () {
                model.forwardLayer();
                model.forwardLayer();
                model.backwardLayer();
                expect(model.get("activeLayer")).to.deep.equal({
                    "title": "Dienst 3",
                    "layerId": "4561"
                });
            });
        });
    });
});
