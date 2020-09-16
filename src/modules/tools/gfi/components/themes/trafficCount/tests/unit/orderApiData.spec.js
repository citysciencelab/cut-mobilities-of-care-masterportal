import {expect} from "chai";
import orderApiData from "../../library/orderApiData.js";

describe("src/modules/tools/gfi/components/themes/trafficCount/library/orderApiData.js", () => {
    describe("orderApiData", () => {
        it("should sort the structure of the given array by the given order", () => {
            const apiData = [
                    {
                        truck: {date3: "value3"},
                        car: {date2: "value2"},
                        bike: {date1: "value1"}
                    },
                    {
                        car: {date5: "value5"},
                        truck: {date6: "value6"},
                        bike: {date4: "value4"}
                    },
                    {
                        car: {date8: "value8"},
                        bike: {date7: "value7"},
                        truck: {date9: "value9"}
                    }
                ],
                order = ["bike", "car", "truck"],
                result = orderApiData(apiData, order),
                expected = [
                    {
                        bike: {date1: "value1"},
                        car: {date2: "value2"},
                        truck: {date3: "value3"}
                    },
                    {
                        bike: {date4: "value4"},
                        car: {date5: "value5"},
                        truck: {date6: "value6"}
                    },
                    {
                        bike: {date7: "value7"},
                        car: {date8: "value8"},
                        truck: {date9: "value9"}
                    }
                ];

            expect(result).to.deep.equal(expected);
        });
    });
});
