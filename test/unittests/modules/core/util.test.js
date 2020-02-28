import Model from "@modules/core/util.js";
import {expect} from "chai";

describe("core/Util", function () {
    let model;

    describe("punctuate", function () {
        before(function () {
            model = new Model();
        });
        it("should set two points for 7 digit number with decimals", function () {
            expect(model.punctuate(1234567.890)).to.equal("1.234.567,89");
        });
        it("should set two  points for 7 digit number", function () {
            expect(model.punctuate(3456789)).to.equal("3.456.789");
        });
        it("should set point for 4 digit number", function () {
            expect(model.punctuate(1000)).to.equal("1.000");
        });
        it("should not set point for 3 digit number", function () {
            expect(model.punctuate(785)).to.equal("785");
        });
        it("should not set point for 2 digit number", function () {
            expect(model.punctuate(85)).to.equal("85");
        });
        it("should not set point for 1 digit number", function () {
            expect(model.punctuate(1)).to.equal("1");
        });
        it("should work with 1 digit number with decimals", function () {
            expect(model.punctuate(5.22)).to.equal("5,22");
        });
    });
    describe("sort", function () {
        before(function () {
            model = new Model();
        });
        // undefined
        it("should return undefined for undefined input", function () {
            expect(model.sort("", undefined)).to.be.undefined;
        });
        // array
        it("should sort array[String] alphanumerically", function () {
            const array = ["Test 11", "Test 1", "Test 2", "Test 5"];

            expect(model.sort("", array)).to.deep.equal(["Test 1", "Test 2", "Test 5", "Test 11"]);
        });
        it("should sort array[int] alphanumerically", function () {
            const array = [11, 1, 2, 5];

            expect(model.sort("", array)).to.deep.equal([1, 2, 5, 11]);
        });
        it("should sort array[float] alphanumerically", function () {
            const array = [11.1, 1.1, 2.1, 5.1];

            expect(model.sort("", array)).to.deep.equal([1.1, 2.1, 5.1, 11.1]);
        });
        // object
        it("should sort array[object] with integers alphanumerically first attr1, then attr2", function () {
            const array = [];

            array.push({attr1: 1, attr2: 11});
            array.push({attr1: 11, attr2: 5});
            array.push({attr1: 5, attr2: 5});
            array.push({attr1: 5, attr2: 1});
            expect(model.sort("", array, "attr1", "attr2")).to.deep.equal([
                {attr1: 1, attr2: 11}, {attr1: 5, attr2: 1}, {attr1: 5, attr2: 5}, {attr1: 11, attr2: 5}
            ]);
        });
        it("should sort array[object] with integers alphanumerically first attr2, then attr1", function () {
            const array = [];

            array.push({attr1: 1, attr2: 11});
            array.push({attr1: 11, attr2: 5});
            array.push({attr1: 5, attr2: 5});
            array.push({attr1: 5, attr2: 1});
            expect(model.sort("", array, "attr2", "attr1")).to.deep.equal([
                {attr1: 5, attr2: 1}, {attr1: 5, attr2: 5}, {attr1: 11, attr2: 5}, {attr1: 1, attr2: 11}
            ]);
        });
        it("should sort array[object] with integers alphanumerically only attr1", function () {
            const array = [];

            array.push({attr1: 1, attr2: 11});
            array.push({attr1: 11, attr2: 5});
            array.push({attr1: 5, attr2: 5});
            array.push({attr1: 5, attr2: 1});
            expect(model.sort("", array, "attr1")).to.deep.equal([
                {attr1: 1, attr2: 11}, {attr1: 5, attr2: 5}, {attr1: 5, attr2: 1}, {attr1: 11, attr2: 5}
            ]);
        });
        it("should sort array[object] with integers alphanumerically only attr2", function () {
            const array = [];

            array.push({attr1: 1, attr2: 11});
            array.push({attr1: 11, attr2: 5});
            array.push({attr1: 5, attr2: 5});
            array.push({attr1: 5, attr2: 1});
            expect(model.sort("", array, "attr2")).to.deep.equal([
                {attr1: 5, attr2: 1}, {attr1: 11, attr2: 5}, {attr1: 5, attr2: 5}, {attr1: 1, attr2: 11}
            ]);
        });
        it("should sort array[object] with integers alphanumerically attr1 === undefined attr2", function () {
            const array = [];

            array.push({attr1: 1, attr2: 11});
            array.push({attr1: 11, attr2: 5});
            array.push({attr1: 5, attr2: 5});
            array.push({attr1: 5, attr2: 1});
            expect(model.sort("", array, undefined, "attr2")).to.deep.equal([
                {attr1: 5, attr2: 1}, {attr1: 11, attr2: 5}, {attr1: 5, attr2: 5}, {attr1: 1, attr2: 11}
            ]);
        });
        it("should sort array[object] with Strings alphanumerically first attr1, then attr2", function () {
            const array = [];

            array.push({attr1: "1", attr2: ""});
            array.push({attr1: "11", attr2: "a"});
            array.push({attr1: "5", attr2: "b"});
            array.push({attr1: "5", attr2: "c"});

            expect(model.sort("", array, "attr1", "attr2")).to.deep.equal([
                {attr1: "1", attr2: ""}, {attr1: "5", attr2: "b"}, {attr1: "5", attr2: "c"}, {attr1: "11", attr2: "a"}
            ]);
        });
        it("should sort array[object] with Strings alphanumerically first attr2, then attr1", function () {
            const array = [];

            array.push({attr1: "1", attr2: ""});
            array.push({attr1: "11", attr2: "a"});
            array.push({attr1: "5", attr2: "b"});
            array.push({attr1: "5", attr2: "c"});

            expect(model.sort("", array, "attr2", "attr1")).to.deep.equal([
                {attr1: "1", attr2: ""}, {attr1: "11", attr2: "a"}, {attr1: "5", attr2: "b"}, {attr1: "5", attr2: "c"}
            ]);
        });

    });

    describe("convertArrayOfObjectsToCsv", function () {
        const array = [{attr1: "der", attr2: "die"}, {attr1: "das", attr2: "hier"}, {attr1: "dort", attr2: "oben"}];

        before(function () {
            model = new Model();
        });
        it("should return a string with a length of 39", function () {
            expect(model.convertArrayOfObjectsToCsv(array)).to.be.a("string").to.have.lengthOf(39);
        });
        it("should find four commtatas", function () {
            expect(model.convertArrayOfObjectsToCsv(array).match(/,/g)).to.have.lengthOf(4);
        });
        it("should find four linebreaks (\n)", function () {
            expect(model.convertArrayOfObjectsToCsv(array).match(/\n/g)).to.have.lengthOf(4);
        });
        it("should find four dollar signs", function () {
            expect(model.convertArrayOfObjectsToCsv(array, "$").match(/\$/g)).to.have.lengthOf(4);
        });
    });

    describe("generate proxy url", function () {
        it("should generate key without hostname from url", function () {
            let proxyURL = "";

            model = new Model();

            proxyURL = model.getProxyURL("https://dies.ist.ein.test/PFAD_ZU_TEST-QUELLE");
            expect(proxyURL).to.be.equal("/dies_ist_ein_test/PFAD_ZU_TEST-QUELLE");
        });

        it("should generate key with hostname from url", function () {
            let proxyURL = "";

            model = new Model({
                proxyHost: "https://test-proxy.example.com"
            });

            proxyURL = model.getProxyURL("https://dies.ist.ein.test/PFAD_ZU_TEST-QUELLE");
            expect(proxyURL).to.be.equal("https://test-proxy.example.com/dies_ist_ein_test/PFAD_ZU_TEST-QUELLE");
        });
        it("shouldn't transform url for local ressources I", function () {
            let proxyURL = "";

            model = new Model({
                proxyHost: "https://test-proxy.example.com"
            });

            proxyURL = model.getProxyURL("http://localhost/test.json");
            expect(proxyURL).to.be.equal("http://localhost/test.json");
        });
        it("shouldn't transform url for local ressources II", function () {
            let proxyURL = "";

            model = new Model({
                proxyHost: "https://test-proxy.example.com"
            });

            proxyURL = model.getProxyURL("./test.json");
            expect(proxyURL).to.be.equal("./test.json");
        });
    });

    describe("renameKeys", function () {
        const obj = {
            name: "Reder",
            job: "Frontend-Master",
            shoeSize: "100"
        };

        before(function () {
            model = new Model();
        });

        it("should return an object", function () {
            expect(model.renameKeys({name: "firstName", job: "passion"}, obj)).to.be.an("object");
        });

        it("should have the keys called firstName and passion", function () {
            expect(model.renameKeys({name: "firstName", job: "passion"}, obj)).to.include({firstName: "Reder", passion: "Frontend-Master"});
        });

        it("should have the key passion", function () {
            expect(model.renameKeys({names: "firstName", job: "passion"}, obj)).to.include({passion: "Frontend-Master"});
        });

        it("should have the keys called name, job and shoeSize", function () {
            expect(model.renameKeys({}, obj)).to.include({name: "Reder", job: "Frontend-Master", shoeSize: "100"});
        });
    });

    describe("renameValues", function () {
        const obj = {
            name: "Reder",
            job: "Frontend_Master",
            shoeSize: "100"
        };

        before(function () {
            model = new Model();
        });

        it("should return an object", function () {
            expect(model.renameValues({Reder: "Vornfeld", Frontend_Master: "Backend_Master"}, obj)).to.be.an("object");
        });

        it("should have the values Vornfeld and Backend_Master", function () {
            expect(model.renameValues({Reder: "Vornfeld", Frontend_Master: "Backend_Master"}, obj)).to.include({name: "Vornfeld", job: "Backend_Master"});
        });

        it("should have the values Reder and Backend_Master", function () {
            expect(model.renameValues({Duden: "Vornfeld", Frontend_Master: "Backend_Master"}, obj)).to.include({name: "Reder", job: "Backend_Master"});
        });

        it("should have the values Reder and Frontend_Master", function () {
            expect(model.renameValues({}, obj)).to.include({name: "Reder", job: "Frontend_Master"});
        });
    });

    describe("pickKeyValuePairs", function () {
        const obj = {
            name: "Reder",
            job: "Frontend_Master",
            shoeSize: "100"
        };

        before(function () {
            model = new Model();
        });

        it("should return an object", function () {
            expect(model.pickKeyValuePairs(obj, ["name", "job"])).to.be.an("object");
        });

        it("should have the keys name and job", function () {
            expect(model.pickKeyValuePairs(obj, ["name", "job"])).to.have.all.keys("name", "job");
        });

        it("should have the key job", function () {
            expect(model.pickKeyValuePairs(obj, [undefined, "job"])).to.have.all.keys("job");
        });

        it("should return an object equals {name: 'Reder', job: 'Frontend_Master'}", function () {
            expect(model.pickKeyValuePairs(obj, ["name", "job"])).to.deep.equal({name: "Reder", job: "Frontend_Master"});
        });
    });

    describe("splitAddressString", function () {
        it("should split addressString with streetname without blank", function () {
            expect(model.splitAddressString("Straße 1, PLZ Stadt", ",", " ")).to.deep.equal([
                "Straße",
                "1",
                "PLZ",
                "Stadt"
            ]);
        });
        it("should split addressString with streetname without blank and housenumber with suffix", function () {
            expect(model.splitAddressString("Straße 1a, PLZ Stadt", ",", " ")).to.deep.equal([
                "Straße",
                "1a",
                "PLZ",
                "Stadt"
            ]);
        });
        it("should split addressString with streetname with blank", function () {
            expect(model.splitAddressString("Platz ohne Namen 1, PLZ Stadt", ",", " ")).to.deep.equal([
                "Platz ohne Namen",
                "1",
                "PLZ",
                "Stadt"
            ]);
        });
    });
    describe("sortObjectsAsAddress", function () {
        it("should return sorted objects", function () {
            const array = [];

            array.push({name: "aStraße 1b, 12345 Stadt"});
            array.push({name: "aStraße 1, 12345 Stadt"});
            array.push({name: "cStraße ohne Namen 10, 12345 Stadt"});
            array.push({name: "aStraße 10, 12345 Stadt"});
            array.push({name: "aStraße 2, 12345 Stadt"});
            array.push({name: "aStraße 1a, 12345 Stadt"});
            array.push({name: "bStraße 10, 12345 Stadt"});
            array.push({name: "12Straße 10, 12345 Stadt"});
            expect(model.sortObjectsAsAddress(array)).to.deep.equal([
                {name: "12Straße 10, 12345 Stadt"},
                {name: "aStraße 1, 12345 Stadt"},
                {name: "aStraße 1a, 12345 Stadt"},
                {name: "aStraße 1b, 12345 Stadt"},
                {name: "aStraße 2, 12345 Stadt"},
                {name: "aStraße 10, 12345 Stadt"},
                {name: "bStraße 10, 12345 Stadt"},
                {name: "cStraße ohne Namen 10, 12345 Stadt"}
            ]);
        });
    });
    describe("isValidAddressString", function () {
        it("should return true for valid address strings", function () {
            expect(model.isValidAddressString("aStraße 1b, 12345 Stadt", ",", " ")).to.be.true;
            expect(model.isValidAddressString("aStraße 1, 12345 Stadt", ",", " ")).to.be.true;
            expect(model.isValidAddressString("cStraße ohne Namen 10, 12345 Stadt", ",", " ")).to.be.true;
        });
        it("should return false for invalid address stringsA", function () {
            expect(model.isValidAddressString("aStraße 1b 12345 Stadt", ",", " ")).to.be.false;
        });
        it("should return false for invalid address stringsB", function () {
            expect(model.isValidAddressString("aStraße, 12345 Stadt", ",", " ")).to.be.false;
        });
    });
});

