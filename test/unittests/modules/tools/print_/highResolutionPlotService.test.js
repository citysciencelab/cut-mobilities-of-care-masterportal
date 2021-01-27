import {expect} from "chai";
import Print2Model from "@modules/tools/print_/highResolutionPlotService.js";

describe("tools/print_/HighResolutionPlotService", function () {
    let print2Model,
        response,
        responseEmpty,
        responseUndef,
        responseNull;

    before(function () {
        print2Model = new Print2Model();

        response = {"scales": [
            {"name": "1:500", "value": "500"},
            {"name": "1:1.000", "value": "1000"},
            {"name": "1:2.500", "value": "2500"},
            {"name": "1:5.000", "value": "5000"},
            {"name": "1:10.000", "value": "10000"},
            {"name": "1:20.000", "value": "20000"},
            {"name": "1:40.000", "value": "40000"},
            {"name": "1:60.000", "value": "60000"},
            {"name": "1:100.000", "value": "100000"},
            {"name": "1:250.000", "value": "250000"}
        ],
        "dpis": [
            {"name": "96", "value": "96"},
            {"name": "128", "value": "128"},
            {"name": "288", "value": "288"}
        ],
        "outputFormats": [
            {"name": "pdf"}
        ],
        "layouts": [
            {"name": "A4 Hochformat", "geoDocument": "A4 Hochformat", "map": {"width": 504, "height": 640}, "rotation": false},
            {"name": "DEE A4", "geoDocument": "dee_pdf_a4_hoch", "map": {"width": 504, "height": 640}, "rotation": false},
            {"name": "DEE A4 quer", "geoDocument": "dee_pdf_a4_quer", "map": {"width": 813, "height": 391}, "rotation": false},
            {"name": "DEE A3", "geoDocument": "dee_pdf_a3_hoch", "map": {"width": 770, "height": 975}, "rotation": false},
            {"name": "DEE A3 quer", "geoDocument": "dee_pdf_a3_quer", "map": {"width": 1101, "height": 690}, "rotation": false},
            {"name": "DEE A2 quer", "geoDocument": "dee_pdf_a2_quer", "map": {"width": 1575, "height": 1050}, "rotation": false},
            {"name": "DEE A1", "geoDocument": "dee_pdf_a1_quer", "map": {"width": 2266, "height": 1533}, "rotation": false},
            {"name": "DEE A0 quer", "geoDocument": "dee_pdf_a0_quer", "map": {"width": 3255, "height": 2242}, "rotation": false}
        ],
        "printURL": "http://dienste.schulung.deegree-enterprise.de/plot-service/print.pdf",
        "createURL": "http://dienste.schulung.deegree-enterprise.de/plot-service/create.json"};

        responseEmpty = {
            "scales": [],
            "dpis": [
                {"name": "96", "value": "96"},
                {"name": "128", "value": "128"},
                {"name": "288", "value": "288"}
            ],
            "outputFormats": [],
            "layouts": [],
            "printURL": "http://dienste.schulung.deegree-enterprise.de/plot-service/print.pdf",
            "createURL": "http://dienste.schulung.deegree-enterprise.de/plot-service/create.json"};

        responseUndef = {
            "dpis": [
                {"name": "96", "value": "96"},
                {"name": "128", "value": "128"},
                {"name": "288", "value": "288"}
            ],
            "printURL": "http://dienste.schulung.deegree-enterprise.de/plot-service/print.pdf",
            "createURL": "http://dienste.schulung.deegree-enterprise.de/plot-service/create.json"};

        responseNull = {
            "scales": null,
            "dpis": [
                {"name": "96", "value": "96"},
                {"name": "128", "value": "128"},
                {"name": "288", "value": "288"}
            ],
            "outputFormats": null,
            "layouts": null,
            "printURL": "http://dienste.schulung.deegree-enterprise.de/plot-service/print.pdf",
            "createURL": "http://dienste.schulung.deegree-enterprise.de/plot-service/create.json"};


    });

    // Setter
    describe("setLayoutList", function () {
        it("should return an empty array for layoutList even if the layouts Parameter in response is undefined", function () {
            print2Model.setLayoutList(responseUndef.layouts);
            expect(print2Model.get("layoutList")).to.deep.equal(responseEmpty.layouts);
        });

        it("should return an empty array for LayoutList", function () {
            print2Model.setLayoutList(responseEmpty.layouts);
            expect(print2Model.get("layoutList")).to.deep.equal(responseEmpty.layouts);
        });

        it("should return an array for layoutList with the layouts from the response", function () {
            print2Model.setLayoutList(response.layouts);
            expect(print2Model.get("layoutList")).to.deep.equal(response.layouts);
        });
    });

    describe("setScaleList", function () {
        it("should return an empty array for scaleList even if the scales Parameter in response is undefined", function () {
            print2Model.setScaleList(responseUndef.scales);
            expect(print2Model.get("scaleList")).to.deep.equal(responseEmpty.scales);
        });

        it("should return an empty array for scaleList", function () {
            print2Model.setScaleList(responseEmpty.scales);
            expect(print2Model.get("scaleList")).to.deep.equal(responseEmpty.scales);
        });

        it("should return an array for scaleList with the scales from the response", function () {
            const scales = [];

            if (Array.isArray(response.scales)) {
                response.scales.forEach(scale => {
                    scales.push(scale.value);
                });
            }

            print2Model.setScaleList(response.scales);
            expect(print2Model.get("scaleList")).to.deep.equal(scales);
        });
    });

    describe("setFormatList", function () {
        it("should return an empty array for formatList even if the outputFormats Parameter in response is undefined", function () {
            print2Model.setFormatList(responseUndef.outputFormats);
            expect(print2Model.get("formatList")).to.deep.equal(responseEmpty.outputFormats);
        });

        it("should return an empty array for formatList", function () {
            print2Model.setFormatList(responseEmpty.outputFormats);
            expect(print2Model.get("formatList")).to.deep.equal(responseEmpty.outputFormats);
        });

        it("should return an array for formatList with the outputFormats from the response", function () {
            const formats = [];

            if (Array.isArray(response.outputFormats)) {
                response.outputFormats.forEach(format => {
                    formats.push(format.name);
                });
            }

            print2Model.setFormatList(response.outputFormats);
            expect(print2Model.get("formatList")).to.deep.equal(formats);
        });
    });

    describe("setCurrentLayout", function () {
        it("should return the first layout object from the layoutList as currentLayout", function () {
            print2Model.setCurrentLayout(response.layouts[0]);
            expect(print2Model.get("currentLayout")).to.deep.equal(response.layouts[0]);
        });
    });

    describe("setCurrentScale", function () {
        it("should return the first layout object from the layoutList as currentScale", function () {
            print2Model.setCurrentScale(response.scales[0]);
            expect(print2Model.get("currentScale")).to.deep.equal(response.scales[0].toString());
        });
    });

    describe("setIsGfiAvailable", function () {
        it("should return false for isGfiAvailable if the passed value is undefined", function () {
            print2Model.setIsGfiAvailable(undefined);
            expect(print2Model.get("isGfiAvailable")).to.be.false;
        });

        it("should return false for isGfiAvailable if the passed value is not of type boolean", function () {
            print2Model.setIsGfiAvailable("testValue");
            expect(print2Model.get("isGfiAvailable")).to.be.false;
        });

        it("should return false for isGfiAvailable if the passed value is false", function () {
            print2Model.setIsGfiAvailable(false);
            expect(print2Model.get("isGfiAvailable")).to.be.false;
        });

        it("should return true for isGfiAvailable if the passed value is true", function () {
            print2Model.setIsGfiAvailable(true);
            expect(print2Model.get("isGfiAvailable")).to.be.true;
        });
    });

    describe("setIsLegendAvailable", function () {
        it("should return false for isLegendAvailable if the passed value is undefined", function () {
            print2Model.setIsLegendAvailable(undefined);
            expect(print2Model.get("isLegendAvailable")).to.be.false;
        });

        it("should return false for isLegendAvailable if the passed value is not of type boolean", function () {
            print2Model.setIsLegendAvailable("testValue");
            expect(print2Model.get("isLegendAvailable")).to.be.false;
        });

        it("should return false for isLegendAvailable if the passed value is false", function () {
            print2Model.setIsLegendAvailable(false);
            expect(print2Model.get("isLegendAvailable")).to.be.false;
        });

        it("should return true for isLegendAvailable if the passed value is true", function () {
            print2Model.setIsLegendAvailable(true);
            expect(print2Model.get("isLegendAvailable")).to.be.true;
        });
    });

    describe("setIsScaleAvailable", function () {
        it("should return false for isScaleAvailable if the passed value is undefined", function () {
            print2Model.setIsScaleAvailable(undefined);
            expect(print2Model.get("isScaleAvailable")).to.be.false;
        });

        it("should return false for isScaleAvailable if the passed value is not of type boolean", function () {
            print2Model.setIsScaleAvailable("testValue");
            expect(print2Model.get("isScaleAvailable")).to.be.false;
        });

        it("should return false for isScaleAvailable if the passed value is false", function () {
            print2Model.setIsScaleAvailable(false);
            expect(print2Model.get("isScaleAvailable")).to.be.false;
        });

        it("should return true for isScaleAvailable if the passed value is true", function () {
            print2Model.setIsScaleAvailable(true);
            expect(print2Model.get("isScaleAvailable")).to.be.true;
        });
    });

    describe("setIsMetaDataAvailable", function () {
        it("should return false for isMetaDataAvailable if the passed value is undefined", function () {
            print2Model.setIsMetaDataAvailable(undefined);
            expect(print2Model.get("isMetaDataAvailable")).to.be.false;
        });

        it("should return false for isMetaDataAvailable if the passed value is not of type boolean", function () {
            print2Model.setIsMetaDataAvailable("testValue");
            expect(print2Model.get("isMetaDataAvailable")).to.be.false;
        });

        it("should return false for isMetaDataAvailable if the passed value is false", function () {
            print2Model.setIsMetaDataAvailable(false);
            expect(print2Model.get("isMetaDataAvailable")).to.be.false;
        });

        it("should return true for isMetaDataAvailable if the passed value is true", function () {
            print2Model.setIsMetaDataAvailable(true);
            expect(print2Model.get("isMetaDataAvailable")).to.be.true;
        });
    });

    describe("setEventListener", function () {
        it("should return the passed event for eventListener", function () {
            const event = Radio.request("Map", "registerListener", "postcompose", print2Model.createPrintMask.bind(print2Model));

            print2Model.setEventListener(event);
            expect(print2Model.get("eventListener")).to.deep.equal(event);
        });
    });

    describe("setCenter", function () {
        it("schould return the passed value for 'center'", function () {
            const center = [567291.68, 5931096.07];

            print2Model.setCenter(center);
            expect(print2Model.get("center")).to.deep.equal(center);
        });
    });

    describe("setCurrentFormat", function () {
        it("should return the passed value for currentFormat", function () {
            const format = {"name": "pdf"};

            print2Model.setCurrentFormat(format);
            expect(print2Model.get("currentFormat")).to.deep.equal(format);
        });
    });

    describe("setIsScaleSelectedManually", function () {
        it("should return false for isScaleSelectedManually if the passed value is undefined", function () {
            print2Model.setIsScaleSelectedManually(undefined);
            expect(print2Model.get("isScaleSelectedManually")).to.be.false;
        });

        it("should return false for isScaleSelectedManually if the passed value is not of type boolean", function () {
            print2Model.setIsScaleSelectedManually("testValue");
            expect(print2Model.get("isScaleSelectedManually")).to.be.false;
        });

        it("should return false for isScaleSelectedManually if the passed value is false", function () {
            print2Model.setIsScaleSelectedManually(false);
            expect(print2Model.get("isScaleSelectedManually")).to.be.false;
        });

        it("should return true for isScaleSelectedManually if the passed value is true", function () {
            print2Model.setIsScaleSelectedManually(true);
            expect(print2Model.get("isScaleSelectedManually")).to.be.true;
        });
    });

    describe("setTitle", function () {
        it("should return the passed value for title", function () {
            const title = "Test Title";

            print2Model.setTitle(title);
            expect(print2Model.get("title")).to.deep.equal(title);
        });
    });

    describe("setIsGfiActive", function () {
        it("should return false for isGfiActive if the passed value is undefined", function () {
            print2Model.setIsGfiActive(undefined);
            expect(print2Model.get("isGfiActive")).to.be.false;
        });

        it("should return false for isGfiActive if the passed value is not of type boolean", function () {
            print2Model.setIsGfiActive("testValue");
            expect(print2Model.get("isGfiActive")).to.be.false;
        });

        it("should return true for isGfiActive if the passed value is true", function () {
            const GFI = true;

            print2Model.setIsGfiActive(GFI);
            expect(print2Model.get("isGfiActive")).to.deep.equal(GFI);
        });

        it("should return false for isGfiActive if the passed value is false", function () {
            const GFI = false;

            print2Model.setIsGfiActive(GFI);
            expect(print2Model.get("isGfiActive")).to.deep.equal(GFI);
        });
    });

    describe("setIsGfiSelected", function () {
        it("should return false for isGfiSelected if the passed value is undefined", function () {
            print2Model.setIsGfiSelected(undefined);
            expect(print2Model.get("isGfiSelected")).to.be.false;
        });

        it("should return false for isGfiSelected if the passed value is not of type boolean", function () {
            print2Model.setIsGfiSelected("testValue");
            expect(print2Model.get("isGfiSelected")).to.be.false;
        });

        it("should return true for isGfiSelected if the passed value is true", function () {
            const GFI = true;

            print2Model.setIsGfiSelected(GFI);
            expect(print2Model.get("isGfiSelected")).to.deep.equal(GFI);
        });

        it("should return false for isGfiSelected if the passed value is false", function () {
            const GFI = false;

            print2Model.setIsGfiSelected(GFI);
            expect(print2Model.get("isGfiSelected")).to.deep.equal(GFI);
        });
    });

    describe("setPostcomposeListener", function () {
        it("should return the passed value for postcomposeListener", function () {
            const eventListener = Radio.request("Map", "registerListener", "postcompose", print2Model.handlePostCompose.bind(print2Model));

            print2Model.setPostcomposeListener(eventListener);
            expect(print2Model.get("postcomposeListener")).to.deep.equal(eventListener);
        });
    });

    describe("setPrecomposeListener", function () {
        it("should return the passed value for precomposeListener", function () {
            const eventListener = Radio.request("Map", "registerListener", "precompose", print2Model.handlePreCompose.bind(print2Model));

            print2Model.setPrecomposeListener(eventListener);
            expect(print2Model.get("precomposeListener")).to.deep.equal(eventListener);
        });
    });

    describe("setScaleByMapView", function () {
        it("should return the scale for the print based on the zoom of the map", function () {
            const result = Radio.request("MapView", "getOptions").scale.toString();

            print2Model.setScaleByMapView();
            expect(print2Model.get("scale")).to.deep.equal(result);
        });
    });

    // Getter
    describe("getCapabilities", function () {
        it("should return the expected response from the plot service", function () {

            print2Model.getCapabilities();
            setTimeout(function () {
                expect(print2Model.get("response")).to.deep.equal(response);
            }, 100);
        });
    });

    describe("getAttributeInLayoutByName", function () {
        it("should return undefined if the passed value do not exist in currentLayout", function () {
            const currentLayout = response.layouts[0];

            print2Model.setCurrentLayout(currentLayout);
            expect(print2Model.getAttributeInLayoutByName("legend")).to.be.undefined;
        });

        it("should return undefined if the passed value is undefined", function () {
            const currentLayout = response.layouts[0];

            print2Model.setCurrentLayout(currentLayout);
            expect(print2Model.getAttributeInLayoutByName(undefined)).to.be.undefined;
        });

        it("should return undefined if the passed value is not of type String", function () {
            const currentLayout = response.layouts[0];

            print2Model.setCurrentLayout(currentLayout);
            expect(print2Model.getAttributeInLayoutByName(2)).to.be.undefined;
        });

        it("should return the object from currentLayout with the name of the passed value", function () {
            const currentLayout = response.layouts[0];

            print2Model.setCurrentLayout(currentLayout);
            expect(print2Model.getAttributeInLayoutByName("map")).to.deep.equal(currentLayout.map);
        });
    });

    describe("componentToHex", function () {
        it("should return one component of the hex color code, if the passed value is a valid part of the rgb code", function () {
            expect(print2Model.componentToHex(255)).to.deep.equal("ff");
        });

        it("should return undefined if the passed value is not a valid part of the rgb code", function () {
            expect(print2Model.componentToHex("Test")).to.deep.equal(undefined);
        });
    });

    describe("rgbToHex", function () {
        it("should return the hex color code, if the passed values are rgb numbers", function () {
            expect(print2Model.rgbToHex(255, 0, 0)).to.deep.equal("#ff0000");
        });

        it("should return undefined if the passed value is a String", function () {
            expect(print2Model.rgbToHex("Test")).to.deep.equal(undefined);
        });
    });

    describe("getColor", function () {
        it("should return a hexadecimal string if the passed value is a rgb(a) string", function () {
            const color = "255, 0, 0",
                hexcolor = {color: "#ff0000", opacity: 1};

            expect(print2Model.getColor(color)).to.deep.equal(hexcolor);
        });

        it("should return a hexadecimal string if the passed value is a hexadecimal string", function () {
            const color = "#ff0000",
                hexcolor = {color: "#ff0000", opacity: 1};

            expect(print2Model.getColor(color)).to.deep.equal(hexcolor);
        });

        it("should return an Error if the passed value is neither a hexadecimal string nor a rgb string", function () {
            const color = true;

            expect(print2Model.getColor(color)).to.deep.equal("Error");
        });

        it("should return an Error if the passed value is null or undefined", function () {
            const color = null;

            expect(print2Model.getColor(color)).to.deep.equal("Error");
        });
    });

    describe("getLayoutByName", function () {
        it("should return the correct Layout from the layoutList with the passed name of the layout", function () {
            const layoutList = print2Model.get("layoutList"),
                layoutName = layoutList[3];

            expect(print2Model.getLayoutByName(layoutList, layoutName.name)).to.deep.equal(layoutName);
        });

        it("should return undefined if the passed name of the layout does not exist in the layoutList", function () {
            const layoutList = print2Model.get("layoutList"),
                layoutName = "test";

            expect(print2Model.getLayoutByName(layoutList, layoutName)).to.deep.equal(undefined);
        });

        it("should return undefined if the passed name is null", function () {
            const layoutList = print2Model.get("layoutList"),
                layoutName = null;

            expect(print2Model.getLayoutByName(layoutList, layoutName)).to.deep.equal(undefined);
        });
    });

    describe("getPrintMapSize", function () {
        it("should return the size of the map", function () {
            const size = [504, 640];

            expect(print2Model.getPrintMapSize()).to.deep.equal(size);
        });
    });

    describe("getOptimalResolution", function () {
        it("should return the optimal resolution for the map with passed scale, mapSize and printMapSize", function () {
            const scale = 2500,
                mapSize = [1920, 887],
                printMapSize = [504, 640],
                optimalResolution = 0.6363535212351648;

            expect(print2Model.getOptimalResolution(scale, mapSize, printMapSize)).to.deep.equal(optimalResolution);
        });

        it("should return an Error if the passed values for scale, mapSize and printMapSize are not valid", function () {
            const scale = "test",
                mapSize = ["mapSize1", "mapSize2"],
                printMapSize = ["test", "test"];

            expect(print2Model.getOptimalResolution(scale, mapSize, printMapSize)).to.deep.equal("Error");
        });

        it("should return an Error if the passed values for scale, mapSize and printMapSize are undefined or null", function () {

            expect(print2Model.getOptimalResolution(undefined, undefined, undefined)).to.deep.equal("Error");
        });
    });

    describe("getOptimalScale", function () {
        it("should return the optimalScale with passed mapSize, resolution, printMapSize and scaleList", function () {
            const mapSize = [1904, 870],
                resolution = 15.874991427504629,
                printMapSize = [504, 640],
                scaleList = ["500", "1000", "2500", "5000", "10000", "20000", "40000", "60000", "100000", "250000"],
                optimalScale = "60000";

            expect(print2Model.getOptimalScale(mapSize, resolution, printMapSize, scaleList)).to.deep.equal(optimalScale);
        });

        it("should return an Error if the passed values for mapSize, resolution, printMapSize or scaleList are not valid", function () {
            const mapSize = ["test", "test1"],
                resolution = "test",
                printMapSize = ["test", "test"],
                scaleList = ["500", "1000", "2500", "5000", "10000", "20000", "40000", "60000", "100000", "250000"];

            expect(print2Model.getOptimalScale(mapSize, resolution, printMapSize, scaleList)).to.deep.equal("Error");
        });

        it("should return an Error if the passed values for mapSize, resolution, printMapSize and scaleList are undefined or null", function () {

            expect(print2Model.getOptimalScale(undefined, undefined, undefined, undefined)).to.deep.equal("Error");
        });
    });

    // other functions
    describe("updateParameter", function () {
        it("should return an Error if the passsed response has empty Arrays for layouts, scales or outputFormats", function () {
            expect(print2Model.updateParameter(responseEmpty)).to.deep.equal("Error");
        });

        it("should return an Error if the passed response is undefined for layouts, scales or outputFormats", function () {
            expect(print2Model.updateParameter(responseUndef)).to.deep.equal("Error");
        });

        it("should return an Error if the passed response is null for layouts, scales or outputFormats", function () {
            expect(print2Model.updateParameter(responseNull)).to.deep.equal("Error");
        });

        it("should return an Error if the passed response is undefined or null", function () {
            expect(print2Model.updateParameter(undefined)).to.deep.equal("Error");
        });

        it("should return an Success if the passed response is valid", function () {
            expect(print2Model.updateParameter(response)).to.deep.equal("success");
        });
    });

    describe("calculatePageBoundsPixels", function () {
        it("should return the pixels of the page bound with a passed mapSize", function () {
            const mapSize = [1920, 887],
                result = [623.99981856, 16.83310293333335, 1296.00018144, 870.1668970666667];

            expect(print2Model.calculatePageBoundsPixels(mapSize)).to.deep.equal(result);
        });

        it("should retrun an Error if the passed mapSize is not valid", function () {
            const mapSize = ["x", "y"];

            expect(print2Model.calculatePageBoundsPixels(mapSize)).to.deep.equal("Error");
        });

        it("should retrun an Error if the passed mapSize is undefined or null", function () {

            expect(print2Model.calculatePageBoundsPixels(undefined)).to.deep.equal("Error");
        });
    });

    describe("createImagePath", function () {
        it("should return the path of an image", function () {
            // Sonderlocke da create imagePath auf das window zugreift. dies gibt es aber im consolen test nicht
            const result = "null/lgv-config/img/";

            expect(print2Model.createImagePath()).to.deep.equal(result);
        });
    });

    describe("push", function () {
        it("should return a the passed array of numbers for the respective, passed attribute", function () {
            const attribute = "layerToPrint",
                value = [[1], [2], [[3.1], [[3.21], [3.22]]], [4]],
                result = [1, 2, 3.1, 3.21, 3.22, 4];

            print2Model.push(attribute, value);
            expect(print2Model.get(attribute)).to.deep.equal(result);
        });

        it("should return a the passed array of numbers and objects for the respective, passed attribute", function () {
            const attribute = "layerToPrint",
                value = [[{"test": 1}], [2], [[3.1], [{"first": 3.21, "second": 3.22}]], [4]],
                result = [{"test": 1}, 2, 3.1, {"first": 3.21, "second": 3.22}, 4];

            print2Model.set(attribute, []);
            print2Model.push(attribute, value);
            expect(print2Model.get(attribute)).to.deep.equal(result);
        });
    });
});
