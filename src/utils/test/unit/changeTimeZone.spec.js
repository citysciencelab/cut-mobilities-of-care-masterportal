import changeTimeZone from "../../changeTimeZone.js";
import {expect} from "chai";

describe("src/utils/changeTimeZone.js", () => {
    it("change a timezone with utc=+1", () => {
        const phenomenonTime = "2020-11-02T09:18:07.516Z",
            utc = "+1";

        expect(changeTimeZone(phenomenonTime, utc)).equals("2020-11-02T10:18:07");
    });

    it("change a timezone with utc=+1 in daylight saving time", () => {
        const phenomenonTime = "2020-10-02T09:18:07.516Z",
            utc = "+1";

        expect(changeTimeZone(phenomenonTime, utc)).equals("2020-10-02T11:18:07");
    });

    it("change a timezone with utc=+1 without utc is specified", () => {
        const phenomenonTime = "2020-11-02T09:18:07.516Z";

        expect(changeTimeZone(phenomenonTime)).equals("2020-11-02T10:18:07");
    });

    it("change a timezone with utc=+11", () => {
        const phenomenonTime = "2020-11-02T22:18:07.516Z",
            utc = "+11";

        expect(changeTimeZone(phenomenonTime, utc)).equals("2020-11-03T09:18:07");
    });

    it("change a timezone with utc=-11", () => {
        const phenomenonTime = "2020-11-02T05:18:07.516Z",
            utc = "-11";

        expect(changeTimeZone(phenomenonTime, utc)).equals("2020-11-01T18:18:07");
    });
});
