import {expect} from "chai";
import collectInfoData from "../../../library/collectInfoData";

describe("src/modules/tools/gfi/components/themes/continuousCountingBike/library/collectInfoData.js", () => {
    describe("collectInfoData", () => {
        it("should sort the structure of the given array by the given order", () => {
            const infoProps =
               {
                   "Fahrräder am Vortag": "13.10.2020|8362",
                   "Fahrräder im Vorjahr": "2019|2201547",
                   "Fahrräder insgesamt seit": "08.10.2014|13158370",
                   "Fahrräder seit Jahresbeginn": "01.01.2020|1970937",
                   "Stärkste Woche im Jahr": "33|75719",
                   "Stärkster Monat im Jahr": "08|297948",
                   "Stärkster Tag im Jahr": "23.06.2020|13947"
               },
                result = collectInfoData(infoProps),
                expected = [
                    {
                        attrName: "Fahrräder insgesamt seit",
                        attrValue: ["08.10.2014", "13.158.370"]
                    },
                    {
                        attrName: "Fahrräder seit Jahresbeginn",
                        attrValue: ["01.01.2020", "1.970.937"]
                    },
                    {
                        attrName: "Fahrräder im Vorjahr",
                        attrValue: ["2019", "2.201.547"]
                    },
                    {
                        attrName: "Fahrräder am Vortag",
                        attrValue: ["13.10.2020", "8.362"]
                    },
                    {
                        attrName: "Stärkster Tag im Jahr",
                        attrValue: ["23.06.2020", "13.947"]
                    },
                    {
                        attrName: "Stärkste Woche im Jahr",
                        attrValue: ["33", "75.719"]
                    },
                    {
                        attrName: "Stärkster Monat im Jahr",
                        attrValue: ["August", "297.948"]
                    }
                ];

            expect(result).to.have.deep.members(expected);
        });
    });
});
