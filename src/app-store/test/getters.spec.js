import {expect} from "chai";
import getters from "../getters.js";

describe("src/app-store/getters.js", () => {
    describe("isSimpleStyle: checks if the simple style is set or not", () => {
        it("should return false if table style is set in the queryParams", () => {
            const state = {
                queryParams: {
                    style: "table"
                }
            };

            expect(getters.isSimpleStyle(state)).to.be.false;
        });

        it("should return true if simple style is set in queryParams", () => {
            const state = {
                queryParams: {
                    style: "simple"
                }
            };

            expect(getters.isSimpleStyle(state)).to.be.true;
        });

        it("should return false if simple style is set in config and table style in queryParams", () => {
            const state = {
                queryParams: {
                    style: "table"
                },
                configJs: {
                    uiStyle: "simple"
                }
            };

            expect(getters.isSimpleStyle(state)).to.be.false;
        });

        it("should return false if style is not set in queryParams and table style is set in the config", () => {
            const state = {
                queryParams: {
                },
                configJs: {
                    uiStyle: "table"
                }
            };

            expect(getters.isSimpleStyle(state)).to.be.false;
        });

        it("should return true if style is undefined in queryParams and simple style is set in the config", () => {
            const state = {
                queryParams: {
                },
                configJs: {
                    uiStyle: "simple"
                }
            };

            expect(getters.isSimpleStyle(state)).to.be.true;
        });

        it("should return false if style neither set in queryParams nor in the config", () => {
            const state = {
                queryParams: {
                },
                configJs: {
                }
            };

            expect(getters.isSimpleStyle(state)).to.be.false;
        });
    });

    describe("isTableStyle: checks if the table style is set or not", () => {
        it("should return false if simple style is set in the queryParams", () => {
            const state = {
                queryParams: {
                    style: "simple"
                }
            };

            expect(getters.isTableStyle(state)).to.be.false;
        });

        it("should return true if table style is set in queryParams", () => {
            const state = {
                queryParams: {
                    style: "table"
                }
            };

            expect(getters.isTableStyle(state)).to.be.true;
        });

        it("should return false if table style is set in config and simple style in queryParams", () => {
            const state = {
                queryParams: {
                    style: "simple"
                },
                configJs: {
                    uiStyle: "table"
                }
            };

            expect(getters.isTableStyle(state)).to.be.false;
        });

        it("should return false if style is undefined in queryParams and simple style is set in the config", () => {
            const state = {
                queryParams: {
                },
                configJs: {
                    uiStyle: "simple"
                }
            };

            expect(getters.isTableStyle(state)).to.be.false;
        });

        it("should return true if style is undefined in queryParams and table style is set in the config", () => {
            const state = {
                queryParams: {
                },
                configJs: {
                    uiStyle: "table"
                }
            };

            expect(getters.isTableStyle(state)).to.be.true;
        });

        it("should return false if style neither set in queryParams nor in the config", () => {
            const state = {
                queryParams: {
                },
                configJs: {
                }
            };

            expect(getters.isTableStyle(state)).to.be.false;
        });
    });

    describe("isDefaultStyle: checks if the default style is set or not", () => {
        it("should return false if table style is set", () => {
            const state = {},
                mockGetters = {
                    isTableStyle: true,
                    isSimpleStyle: false
                };

            expect(getters.isDefaultStyle(state, mockGetters)).to.be.false;
        });

        it("should return false if simple style is set", () => {
            const state = {},
                mockGetters = {
                    isTableStyle: false,
                    isSimpleStyle: true
                };

            expect(getters.isDefaultStyle(state, mockGetters)).to.be.false;
        });

        it("should return true if neither is set simple style nor table style", () => {
            const state = {},
                mockGetters = {
                    isTableStyle: false,
                    isSimpleStyle: false
                };

            expect(getters.isDefaultStyle(state, mockGetters)).to.be.true;
        });
    });
});
