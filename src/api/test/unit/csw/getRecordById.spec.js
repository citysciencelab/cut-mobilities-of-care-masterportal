import {expect} from "chai";
import {getMdIdentification, parseTitle} from "../../../csw/getRecordById.js";

const jsonWithMD_DataIdentification = {
        GetRecordByIdResponse: {
            MD_Metadata: {
                identificationInfo: {
                    MD_DataIdentification: {
                        citation: {
                            CI_Citation: {
                                title: {
                                    CharacterString: {
                                        getValue: () => "Batman"
                                    }
                                },
                                date: [
                                    {
                                        CI_Date: {
                                            date: {
                                                Date: {
                                                    getValue: () => "18.03.2021"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        CI_Date: {
                                            date: {
                                                Date: {
                                                    getValue: () => "19.04.2022"
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }
    },
    jsonWithSV_ServiceIdentification = {
        GetRecordByIdResponse: {
            MD_Metadata: {
                identificationInfo: {
                    SV_ServiceIdentification: {
                        citation: {
                            CI_Citation: {
                                title: {
                                    CharacterString: {
                                        getValue: () => "Robin"
                                    }
                                },
                                date: [
                                    {
                                        CI_Date: {
                                            date: {
                                                Date: {
                                                    getValue: () => "01.01.1999"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        CI_Date: {
                                            date: {
                                                Date: {
                                                    getValue: () => "02.02.2000"
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }
    };


describe("src/api/csw/getRecordById.js", () => {
    describe("getMdIdentification", () => {
        it("should return the node MD_DataIdentification if exist", () => {
            expect(getMdIdentification(jsonWithMD_DataIdentification)).to.deep.equal(
                jsonWithMD_DataIdentification.GetRecordByIdResponse.MD_Metadata.identificationInfo.MD_DataIdentification
            );
        });
        it("should return the node SV_ServiceIdentification if exist", () => {
            expect(getMdIdentification(jsonWithSV_ServiceIdentification)).to.deep.equal(
                jsonWithSV_ServiceIdentification.GetRecordByIdResponse.MD_Metadata.identificationInfo.SV_ServiceIdentification
            );
        });
    });

    describe("parseTitle", () => {
        it("should return the title with the MD_Identification node as MD_DataIdentification", () => {
            expect(parseTitle(jsonWithMD_DataIdentification)).to.equals("Batman");
        });
        it("should return the title with the MD_Identification node as SV_ServiceIdentification", () => {
            expect(parseTitle(jsonWithSV_ServiceIdentification)).to.equals("Robin");
        });
    });
});
