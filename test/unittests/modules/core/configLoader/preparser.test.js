import {expect} from "chai";
import Preparser from "@modules/core/configLoader/preparser.js";

describe("core/configLoader/preparser", function () {
    let preparser;

    before(function () {
        preparser = new Preparser(null, {url: Config.portalConf});
    });

    describe("global isFolderSelectable", function () {
        it("should be true if set to true in config", function () {
            expect(preparser.parseIsFolderSelectable(true)).to.be.true;
        });
        it("should be false if set to false in config", function () {
            expect(preparser.parseIsFolderSelectable(false)).to.be.false;
        });
        it("should be true if not set in config (default value)", function () {
            expect(preparser.parseIsFolderSelectable(undefined)).to.be.true;
        });
    });

    describe("should return a valid config path", function () {

        it("should return an absolute url (https)", function () {
            preparser.requestConfigFromUtil = function () {
                return "https://localhost:1234/testconfig.json";
            };
            expect(preparser.getUrlPath("../../portal/master", preparser.requestConfigFromUtil())).to.be.equal("https://localhost:1234/testconfig.json");
        });

        it("should return an absolute url (http)", function () {
            preparser.requestConfigFromUtil = function () {
                return "http://localhost:1234/testconfig.json";
            };
            expect(preparser.getUrlPath("../../portal/master", preparser.requestConfigFromUtil())).to.be.equal("http://localhost:1234/testconfig.json");
        });

        it("should return a relative url (remove trailing slash)", function () {
            preparser.requestConfigFromUtil = function () {
                return "../someTestConfig.json";
            };
            expect(preparser.getUrlPath("../../portal/master/", preparser.requestConfigFromUtil())).to.be.equal("../../portal/master/../someTestConfig.json");
        });

        it("should return a relative url (remove leading slash)", function () {
            preparser.requestConfigFromUtil = function () {
                return "/someTestConfig.json";
            };
            expect(preparser.getUrlPath("../../portal/master", preparser.requestConfigFromUtil())).to.be.equal("../../portal/master/someTestConfig.json");
        });

        it("should return default url", function () {
            preparser.requestConfigFromUtil = function () {
                return "";
            };
            expect(preparser.getUrlPath("../../portal/master", preparser.requestConfigFromUtil())).to.be.equal("config.json");
        });

        it("should return absolute url by no portalConf is configured", function () {
            preparser.requestConfigFromUtil = function () {
                return "https://localhost:1234/testconfig.json";
            };
            expect(preparser.getUrlPath(undefined, preparser.requestConfigFromUtil())).to.be.equal("https://localhost:1234/testconfig.json");
        });
    });
});
