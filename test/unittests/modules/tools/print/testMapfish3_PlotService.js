import {expect} from "chai";
import PrintModel from "@modules/tools/print_/Mapfish3_PlotServicel.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";

describe("tools/print_/model", function () {
    var printModel;

    before(function () {
        printModel = new PrintModel();
    });

    describe("sortVisibleLayerListByZindex", function () {
        it("should return an sorted array by input with zIndeces", function () {
            var array = [],
                layer1 = new VectorLayer({
                    source: new VectorSource()
                }),
                layer2 = new VectorLayer({
                    source: new VectorSource()
                }),
                layer3 = new VectorLayer({
                    source: new VectorSource()
                });

            layer1.setZIndex(10);
            layer2.setZIndex(9);
            layer3.setZIndex(11);

            array.push(layer1);
            array.push(layer2);
            array.push(layer3);

            expect(printModel.sortVisibleLayerListByZindex(array)).to.be.an("array")
                .to.include.ordered.members([layer2, layer1, layer3]);
        });

        it("should return an sorted array by input with zIndeces und without indeces", function () {
            var array = [],
                layer1 = new VectorLayer({
                    source: new VectorSource()
                }),
                layer2 = new VectorLayer({
                    source: new VectorSource()
                }),
                layer3 = new VectorLayer({
                    source: new VectorSource()
                });

            layer1.setZIndex(10);
            layer3.setZIndex(9);

            array.push(layer1);
            array.push(layer2);
            array.push(layer3);

            expect(printModel.sortVisibleLayerListByZindex(array)).to.be.an("array")
                .to.include.ordered.members([layer2, layer3, layer1]);
        });

        it("should return an empty array by empty array input", function () {
            expect(printModel.sortVisibleLayerListByZindex([])).to.be.an("array");
        });
    });
});