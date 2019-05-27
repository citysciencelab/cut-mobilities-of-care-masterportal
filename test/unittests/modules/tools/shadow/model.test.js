import {expect} from "chai";
import Model from "@modules/tools/shadow/model.js";
import moment from "moment";

let model;

before(function () {
    model = new Model();
});

describe("tools/shadow/model", function () {
    describe("function for combineTimeAndDate", function () {
        it("should return the new timestamp", function () {
            expect(model.combineTimeAndDate(1558692000000, 1558648800000)).to.equal(1558692000000);
        });
    });

    describe("function for checkIsShadowEnabled", function () {
        it("should return the maps default = false", function () {
            expect(model.checkIsShadowEnabled()).to.equal(false);
        });
    });

    describe("function for checkIsMap3d", function () {
        it("should return the maps default = false", function () {
            expect(model.checkIsMap3d()).to.equal(false);
        });
    });

    describe("function for toggleButtonValueChanged", function () {
        it("should still return false because the map is still 2D", function () {
            model.toggleButtonValueChanged(true);
            expect(model.checkIsShadowEnabled()).to.equal(false);
        });
    });

    describe("function for getMinMaxDatesOfCurrentYear", function () {
        const min = moment().startOf("year").valueOf(),
            max = moment().endOf("year").valueOf();

        it("should return the timestamps", function () {
            expect(model.getMinMaxDatesOfCurrentYear()).to.be.an("array").that.includes(min, max);
        });
    });

    describe("function for getMinMaxTimesOfCurrentDay", function () {
        const min = moment().startOf("day").valueOf(),
            max = moment().endOf("day").valueOf();

        it("should return the timestamps", function () {
            expect(model.getMinMaxTimesOfCurrentDay()).to.be.an("array").that.includes(min, max);
        });
    });

    describe("function for getNearestTime", function () {
        const minutes = moment().minutes(),
            setminutes = minutes < 30 ? 0 : 30;

        it("should return the timestamp", function () {
            expect(model.getNearestTime()).to.equal(moment().minutes(setminutes).seconds(0).millisecond(0).valueOf());
        });
    });

    describe("function for getToday", function () {
        it("should return the timestamp", function () {
            expect(model.getToday()).to.equal(moment().startOf("day").valueOf());
        });
    });

    describe("function for getNewDatepicker", function () {
        it("should return a datepicker", function () {
            expect(model.getNewDatepicker()).to.be.an("object");
        });
    });

    describe("function for getNewSlider", function () {
        it("should return a slider", function () {
            expect(model.getNewSlider()).to.be.an("object");
        });
    });

    describe("function for getNewButton", function () {
        it("should return a button", function () {
            expect(model.getNewButton()).to.be.an("object");
        });
    });
});
