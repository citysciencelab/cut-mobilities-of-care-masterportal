import {expect} from "chai";
import Model from "@modules/clickCounter/model.js";

describe("clickCounter/model", function () {
    describe("returns the correct URL without an staticLink tag", function () {
        let model;

        const desktopURL = "https://static.hamburg.de/countframes/verkehrskarte_count.html",
            mobileURL = "https://static.hamburg.de/countframes/verkehrskarte-mobil_count.html";

        before(function () {
            model = new Model(desktopURL, mobileURL);
        });

        it("should set desktopURL as aspected", function () {
            expect(model.get("desktopURL")).to.be.a("string", "https://static.hamburg.de/countframes/verkehrskarte_count.html");
        });
        it("should set mobileURL as aspected", function () {
            expect(model.get("mobileURL")).to.be.a("string", "https://static.hamburg.de/countframes/verkehrskarte-mobil_count.html");
        });
    });
    describe("returns the correct URL with staticLink desktop", function () {
        let model;

        const desktopURL = "https://static.hamburg.de/countframes/verkehrskarte_count.html",
            mobileURL = "https://static.hamburg.de/countframes/verkehrskarte-mobil_count.html";

        before(function () {
            model = new Model(desktopURL, mobileURL, "desktop");
        });

        it("should set desktopURL as aspected", function () {
            expect(model.get("desktopURL")).to.be.a("string", "https://static.hamburg.de/countframes/verkehrskarte_count.html");
        });
        it("should set mobileURL as aspected", function () {
            expect(model.get("mobileURL")).to.be.a("string", "https://static.hamburg.de/countframes/verkehrskarte_count.html");
        });
    });
    describe("returns the correct URL with staticLink mobile", function () {
        let model;

        const desktopURL = "https://static.hamburg.de/countframes/verkehrskarte_count.html",
            mobileURL = "https://static.hamburg.de/countframes/verkehrskarte-mobil_count.html";

        before(function () {
            model = new Model(desktopURL, mobileURL, "mobile");
        });

        it("should set desktopURL as aspected", function () {
            expect(model.get("desktopURL")).to.be.a("string", "https://static.hamburg.de/countframes/verkehrskarte-mobil_count.html");
        });
        it("should set mobileURL as aspected", function () {
            expect(model.get("mobileURL")).to.be.a("string", "https://static.hamburg.de/countframes/verkehrskarte-mobil_count.html");
        });
    });
    describe("returns the correct URL for mobile devices", function () {
        let model;

        const desktopURL = "https://static.hamburg.de/countframes/verkehrskarte_count.html",
            mobileURL = "https://static.hamburg.de/countframes/verkehrskarte-mobil_count.html";

        before(function () {
            model = new Model(desktopURL, mobileURL);
            model.setIsMobile(true);
        });

        it("should return mobileURL as aspected", function () {
            expect(model.getURL()).to.be.a("string", "https://static.hamburg.de/countframes/verkehrskarte-mobil_count.html");
        });
    });
    describe("returns the correct URL for desktop devices", function () {
        let model;

        const desktopURL = "https://static.hamburg.de/countframes/verkehrskarte_count.html",
            mobileURL = "https://static.hamburg.de/countframes/verkehrskarte-mobil_count.html";

        before(function () {
            model = new Model(desktopURL, mobileURL);
            model.setIsMobile(false);
        });

        it("should return mobileURL as aspected", function () {
            expect(model.getURL()).to.be.a("string", "https://static.hamburg.de/countframes/verkehrskarte_count.html");
        });
    });
});
