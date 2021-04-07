import getProxyUrl from "../../getProxyUrl.js";
import {expect} from "chai";

describe("src/utils/getProxyUrl", function () {
    it("should generate key without hostname from url", function () {
        expect(getProxyUrl("https://dies.ist.ein.test/PFAD_ZU_TEST-QUELLE")).to.be.equal("/dies_ist_ein_test/PFAD_ZU_TEST-QUELLE");
    });

    it("should generate key with hostname from url", function () {
        const url = "https://dies.ist.ein.test/PFAD_ZU_TEST-QUELLE",
            proxyHost = "https://test-proxy.example.com";

        expect(getProxyUrl(url, proxyHost)).to.be.equal("https://test-proxy.example.com/dies_ist_ein_test/PFAD_ZU_TEST-QUELLE");
    });
    it("shouldn't transform url for local resources I", function () {
        const url = "http://localhost/test.json",
            proxyHost = "https://test-proxy.example.com";

        expect(getProxyUrl(url, proxyHost)).to.be.equal("http://localhost/test.json");
    });
    it("shouldn't transform url for local resources II", function () {
        const url = "./test.json",
            proxyHost = "https://test-proxy.example.com";

        expect(getProxyUrl(url, proxyHost)).to.be.equal("./test.json");
    });
});
