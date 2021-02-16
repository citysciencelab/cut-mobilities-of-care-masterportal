import {expect} from "chai";
import {handleResponseAxios, parseDocumentString, parseFeatures} from "../../wmsGetFeatureInfo.js";

describe("src/api/wmsGetFeatureInfo.js", () => {
    describe("handleResponseAxios", () => {
        const testFunctions = {
            getResponse: response => {
                try {
                    return handleResponseAxios(response);
                }
                catch (err) {
                    return err;
                }
            }
        };

        it("should throw an error if the received object is no valid axios object", () => {
            expect(testFunctions.getResponse(undefined)).to.be.an.instanceof(Error);
            expect(testFunctions.getResponse(null)).to.be.an.instanceof(Error);
            expect(testFunctions.getResponse(1234)).to.be.an.instanceof(Error);
            expect(testFunctions.getResponse("string")).to.be.an.instanceof(Error);
            expect(testFunctions.getResponse(true)).to.be.an.instanceof(Error);
            expect(testFunctions.getResponse([])).to.be.an.instanceof(Error);
            expect(testFunctions.getResponse({})).to.be.an.instanceof(Error);
            expect(testFunctions.getResponse({
                status: 200
            })).to.be.an.instanceof(Error);
            expect(testFunctions.getResponse({
                statusText: "statusText"
            })).to.be.an.instanceof(Error);
            expect(testFunctions.getResponse({
                data: "data"
            })).to.be.an.instanceof(Error);
        });
        it("should throw an error if the status code is not positive", () => {
            expect(testFunctions.getResponse({
                status: 440,
                statusText: "statusText",
                data: "data"
            })).to.be.an.instanceof(Error);
        });
        it("should return the data part from a valid axios response object with a positive status code", () => {
            expect(testFunctions.getResponse({
                status: 200,
                statusText: "statusText",
                data: "data"
            })).to.equal("data");
        });
    });

    describe("parseDocumentString", () => {
        it("should throw an error if the document can't be parsed", () => {
            const testFunctions = {
                    getResult: (documentString, mimeType, parserResponse) => {
                        try {
                            return parseDocumentString(documentString, mimeType, () => {
                                // parseFromStringOpt: simulating response
                                return parserResponse;
                            });
                        }
                        catch (err) {
                            return err;
                        }
                    }
                },
                documentString = "<TestTag>testData</TestTag>";

            expect(testFunctions.getResult(documentString, "text/html", null)).to.be.an.instanceof(Error);
            expect(testFunctions.getResult(documentString, "text/html", undefined)).to.be.an.instanceof(Error);
            expect(testFunctions.getResult(documentString, "text/html", 1234)).to.be.an.instanceof(Error);
            expect(testFunctions.getResult(documentString, "text/html", "string")).to.be.an.instanceof(Error);
            expect(testFunctions.getResult(documentString, "text/html", true)).to.be.an.instanceof(Error);
            expect(testFunctions.getResult(documentString, "text/html", [])).to.be.an.instanceof(Error);
            expect(testFunctions.getResult(documentString, "text/html", {})).to.be.an.instanceof(Error);
        });
        it("should throw an error if the document reports a parsererror", () => {
            const testFunctions = {
                parseFromStringOpt: () => {
                    const parser = new DOMParser(),
                        documentString = "<?xml version='1.0' encoding='UTF-8'?><parsererror>error</parsererror>";

                    return parser.parseFromString(documentString, "text/xml");
                }
            };
            let result = null;

            try {
                result = parseDocumentString("documentString", "mimeType", testFunctions.parseFromStringOpt);
            }
            catch (err) {
                result = err;
            }
            expect(result).to.be.an.instanceof(Error);
        });

        it("should return a parsed Document from the given documentString as text/html", () => {
            const testFunctions = {
                    parseFromStringOpt: (documentString, mimeType) => {
                        const parser = new DOMParser();

                        return parser.parseFromString(documentString, mimeType);
                    }
                },
                documentString = "<TestTag>testData</TestTag>",
                expected = "<head></head><body><testtag>testData</testtag></body>",
                result = parseDocumentString(documentString, "text/html", testFunctions.parseFromStringOpt);

            expect(result).to.be.an.instanceof(Document);
            expect(result.firstElementChild.innerHTML).to.equal(expected);
        });
        it("should return a parsed Document from the given documentString as text/xml", () => {
            const testFunctions = {
                    parseFromStringOpt: (documentString, mimeType) => {
                        const parser = new DOMParser();

                        return parser.parseFromString(documentString, mimeType);
                    }
                },
                documentString = "<?xml version='1.0' encoding='UTF-8'?><TestTag>testData</TestTag>",
                expected = "testData",
                result = parseDocumentString(documentString, "text/xml", testFunctions.parseFromStringOpt);

            expect(result).to.be.an.instanceof(Document);
            expect(result.firstElementChild.innerHTML).to.equal(expected);
        });
        it("should return a feature from the given documentString as text/xml with the infoFormat application/vnd.ogc.gml", () => {
            const documentString = `<?xml version="1.0" encoding="UTF-8"?>
                <wfs:FeatureCollection xmlns="http://www.opengis.net/wfs" xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:geofox_workspace="geofox" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs https://map.geofox.de:443/geoserver/schemas/wfs/1.0.0/WFS-basic.xsd geofox https://map.geofox.de:443/geoserver/geofox_workspace/wfs?service=WFS&amp;version=1.0.0&amp;request=DescribeFeatureType&amp;typeName=geofox_workspace%3Ageofoxdb_stations">
                    <gml:boundedBy>
                        <gml:null>unknown</gml:null>
                    </gml:boundedBy>
                    <gml:featureMember>
                        <geofox_workspace:geofoxdb_stations fid="geofoxdb_stations.fid-3964547_1763c18f793_4f8c">
                            <geofox_workspace:supplier>Master</geofox_workspace:supplier>
                            <geofox_workspace:id>80000</geofox_workspace:id>
                            <geofox_workspace:name>Thadenstrasse (West)</geofox_workspace:name>
                            <geofox_workspace:x>3563130</geofox_workspace:x>
                            <geofox_workspace:y>5936370</geofox_workspace:y>
                            <geofox_workspace:lines>610,283</geofox_workspace:lines>
                            <geofox_workspace:linekat>Niederflur-Nachtbus,Niederflur Stadtbus</geofox_workspace:linekat>
                            <geofox_workspace:lineshortkat>Nachtbus,Bus</geofox_workspace:lineshortkat>
                            <geofox_workspace:geom>
                                <gml:Point srsName="http://www.opengis.net/gml/srs/epsg.xml#25832">
                                    <gml:coordinates xmlns:gml="http://www.opengis.net/gml" decimal="." cs="," ts=" ">563033.73375521,5934434.5087641</gml:coordinates>
                                </gml:Point>
                            </geofox_workspace:geom>
                            <geofox_workspace:short_name>ThadenstraÃe (West)</geofox_workspace:short_name>
                            <geofox_workspace:priority>0</geofox_workspace:priority>
                        </geofox_workspace:geofoxdb_stations>
                    </gml:featureMember>
                </wfs:FeatureCollection>`,
                parser = new DOMParser(),
                features = parseFeatures(parser.parseFromString(documentString, "text/xml"));

            expect(features.length).equals(1);
            expect(features[0].get("x")).equals("3563130");
            expect(features[0].get("y")).equals("5936370");
            expect(features[0].get("name")).equals("Thadenstrasse (West)");
            expect(features[0].get("linekat")).equals("Niederflur-Nachtbus,Niederflur Stadtbus");
            expect(features[0].get("lineshortkat")).equals("Nachtbus,Bus");
            expect(features[0].getGeometry().getCoordinates()).to.include(563033.73375521, 5934434.5087641, 0);
        });
        it("should return a feature from mapserver service with the given documentString as text/xml with the infoFormat application/vnd.ogc.gml", () => {
            const documentString = `<msGMLOutput
                xmlns:gml="http://www.opengis.net/gml"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
                    <addresses_layer>
                    <gml:name>Example</gml:name>
                        <addresses_feature>
                            <gml:boundedBy>
                                <gml:Box srsName="EPSG:25832">
                                    <gml:coordinates>412600.660000,5315290.100000 412600.660000,5315290.100000</gml:coordinates>
                                </gml:Box>
                            </gml:boundedBy>
                            <id>82549</id>
                            <str_strs_a>04480</str_strs_a>
                            <hnr_a>3</hnr_a>
                            <x_coord>412600.66</x_coord>
                            <y_coord>5315290.1</y_coord>
                        </addresses_feature>
                    </addresses_layer>
                </msGMLOutput>`,
                parser = new DOMParser(),
                features = parseFeatures(parser.parseFromString(documentString, "text/xml"));

            expect(features.length).equals(1);
            expect(features[0].get("id")).equals("82549");
            expect(features[0].get("hnr_a")).equals("3");
            expect(features[0].get("str_strs_a")).equals("04480");
            expect(features[0].get("x_coord")).equals("412600.66");
            expect(features[0].get("y_coord")).equals("5315290.1");
        });
    });
});

