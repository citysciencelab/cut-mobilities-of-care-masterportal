import {expect} from "chai";
import {handleResponseAxios, parseDocumentString} from "../../wmsGetFeatureInfo.js";

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
    });
});

