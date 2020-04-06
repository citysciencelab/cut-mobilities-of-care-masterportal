import View from "@modules/tools/gfi/themes/bildungsatlas/schulenWohnort/view.js";
import Model from "@modules/tools/gfi/themes/bildungsatlas/schulenWohnort/model.js";
import {expect} from "chai";

let view,
    model;

before(function () {
    model = new Model();
    view = new View({
        model: model
    });
});

describe("tools/gfi/themes/bildungsatlas/schulenWohnort/view", function () {
    describe("addHtmlMouseHoverCode", function () {
        it("should add html code to the html value of all school objects that belong to the requested district", function () {
            const UnitTestSchulenWohnortSchool = class {
                    /**
                     * constructor
                     * @param {Integer} id the id of the school as number
                     * @param {Integer} StatGeb_Nr the code of the district as number
                     * @param {*} someValue test value to be returned on specific conditions
                     */
                    constructor (id, StatGeb_Nr, someValue) {
                        this.id = id;
                        this.StatGeb_Nr = StatGeb_Nr;
                        this.someValue = someValue;
                        this.testResult = false;
                    }

                    /**
                     * getter for this.someValue on certain conditions
                     * @param {*} key the key to get data if condition "SG_" + this.StatGeb_Nr is fulfilled this.someValue is returned
                     * @returns {*|Undefined}  returns this.someValue if condition is fulfilled, returns undefined if otherwise
                     */
                    get (key) {
                        if (key === "SG_" + this.StatGeb_Nr) {
                            return this.someValue;
                        }
                        return undefined;
                    }

                    /**
                     * pseudo setter - sets this.testResult to value if key equals "html"
                     * @param {*} key will be ignored if not a String equaling "html"
                     * @param {String} value the value to set this.testResult if key equals "html"
                     * @returns {Void}  -
                     */
                    set (key, value) {
                        if (key === "html") {
                            this.testResult = value;
                        }
                    }

                    /**
                     * getter for this.testResult
                     * @returns {String|Boolean}  is a String set by the set method or left as Boolean false if something went wrong
                     */
                    getTestResult () {
                        return this.testResult;
                    }
                },
                schools = [
                    new UnitTestSchulenWohnortSchool(1, 123456789, 50),
                    new UnitTestSchulenWohnortSchool(2, 123456789, 25),
                    new UnitTestSchulenWohnortSchool(3, 987654321, 15),
                    new UnitTestSchulenWohnortSchool(4, 987654321, 10)
                ];

            let expectationFirstEntryWindows = "",
                expectationFirstEntryLinux = "";

            expectationFirstEntryWindows += "<!DOCTYPE html>\r\n";
            expectationFirstEntryWindows += "<table class=\"table table-striped\">\r\n";
            expectationFirstEntryWindows += "    <thead>\r\n";
            expectationFirstEntryWindows += "        <tr>\r\n";
            expectationFirstEntryWindows += "            <th colspan=\"3\"></th>\r\n";
            expectationFirstEntryWindows += "        </tr>\r\n";
            expectationFirstEntryWindows += "    </thead>\r\n";
            expectationFirstEntryWindows += "    <tbody>\r\n";
            expectationFirstEntryWindows += "        <tr>\r\n";
            expectationFirstEntryWindows += "            <td width=\"25%\">Adresse:</td>\r\n";
            expectationFirstEntryWindows += "            <td colspan=\"2\"> <br> </td>\r\n";
            expectationFirstEntryWindows += "        </tr>\r\n";
            expectationFirstEntryWindows += "        <tr>\r\n";
            expectationFirstEntryWindows += "            <td colspan=\"2\">Gesamtanzahl der Schüler:</td>\r\n";
            expectationFirstEntryWindows += "            <td width=\"25%\"></td>\r\n";
            expectationFirstEntryWindows += "        </tr>\r\n";
            expectationFirstEntryWindows += "        <tr>\r\n";
            expectationFirstEntryWindows += "            <td colspan=\"2\">Anzahl der Schülerinnen und Schüler<br> in der Primarstufe:</td>\r\n";
            expectationFirstEntryWindows += "            <td></td>\r\n";
            expectationFirstEntryWindows += "        </tr>\r\n";
            expectationFirstEntryWindows += "        <tr>\r\n";
            expectationFirstEntryWindows += "            <td colspan=\"2\">Sozialindex der Schüler:</td>\r\n";
            expectationFirstEntryWindows += "            <td></td>\r\n";
            expectationFirstEntryWindows += "        </tr>\r\n";
            expectationFirstEntryWindows += "        <tr>\r\n";
            expectationFirstEntryWindows += "            <td colspan=\"2\">Anteil der Schülerschaft des angeklickten<br> Gebiets, der diese Schule besucht<br> an der gesamten Schülerschaft des<br> angeklickten Gebiets (foo):</td>\r\n";
            expectationFirstEntryWindows += "            <td>50%</td>\r\n";
            expectationFirstEntryWindows += "        </tr>\r\n";
            expectationFirstEntryWindows += "        <tr>\r\n";
            expectationFirstEntryWindows += "            <td colspan=\"2\">Anzahl:</td>\r\n";
            expectationFirstEntryWindows += "            <td>50</td>\r\n";
            expectationFirstEntryWindows += "        </tr>\r\n";
            expectationFirstEntryWindows += "    </tbody>\r\n";
            expectationFirstEntryWindows += "</table>";

            expectationFirstEntryLinux += "<!DOCTYPE html>\n";
            expectationFirstEntryLinux += "<table class=\"table table-striped\">\n";
            expectationFirstEntryLinux += "    <thead>\n";
            expectationFirstEntryLinux += "        <tr>\n";
            expectationFirstEntryLinux += "            <th colspan=\"3\"></th>\n";
            expectationFirstEntryLinux += "        </tr>\n";
            expectationFirstEntryLinux += "    </thead>\n";
            expectationFirstEntryLinux += "    <tbody>\n";
            expectationFirstEntryLinux += "        <tr>\n";
            expectationFirstEntryLinux += "            <td width=\"25%\">Adresse:</td>\n";
            expectationFirstEntryLinux += "            <td colspan=\"2\"> <br> </td>\n";
            expectationFirstEntryLinux += "        </tr>\n";
            expectationFirstEntryLinux += "        <tr>\n";
            expectationFirstEntryLinux += "            <td colspan=\"2\">Gesamtanzahl der Schüler:</td>\n";
            expectationFirstEntryLinux += "            <td width=\"25%\"></td>\n";
            expectationFirstEntryLinux += "        </tr>\n";
            expectationFirstEntryLinux += "        <tr>\n";
            expectationFirstEntryLinux += "            <td colspan=\"2\">Anzahl der Schülerinnen und Schüler<br> in der Primarstufe:</td>\n";
            expectationFirstEntryLinux += "            <td></td>\n";
            expectationFirstEntryLinux += "        </tr>\n";
            expectationFirstEntryLinux += "        <tr>\n";
            expectationFirstEntryLinux += "            <td colspan=\"2\">Sozialindex der Schüler:</td>\n";
            expectationFirstEntryLinux += "            <td></td>\n";
            expectationFirstEntryLinux += "        </tr>\n";
            expectationFirstEntryLinux += "        <tr>\n";
            expectationFirstEntryLinux += "            <td colspan=\"2\">Anteil der Schülerschaft des angeklickten<br> Gebiets, der diese Schule besucht<br> an der gesamten Schülerschaft des<br> angeklickten Gebiets (foo):</td>\n";
            expectationFirstEntryLinux += "            <td>50%</td>\n";
            expectationFirstEntryLinux += "        </tr>\n";
            expectationFirstEntryLinux += "        <tr>\n";
            expectationFirstEntryLinux += "            <td colspan=\"2\">Anzahl:</td>\n";
            expectationFirstEntryLinux += "            <td>50</td>\n";
            expectationFirstEntryLinux += "        </tr>\n";
            expectationFirstEntryLinux += "    </tbody>\n";
            expectationFirstEntryLinux += "</table>";

            view.addHtmlMouseHoverCode(schools, "foo", 123456789, 100);

            expect(schools[0].getTestResult()).to.be.oneOf([expectationFirstEntryWindows, expectationFirstEntryLinux]);

            expect(schools[2].getTestResult()).to.be.false;
            expect(schools[3].getTestResult()).to.be.false;
        });
    });
});
