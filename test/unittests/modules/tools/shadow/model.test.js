import {expect} from "chai";
import Model from "@modules/tools/shadow/model.js";
import moment from "moment";


describe("tools/shadow/model", function () {
    let model;

    before(function () {
        model = new Model();
    });

    describe("function for combineTimeAndDate", function () {
        it("should return the new timestamp", function () {
            expect(model.combineTimeAndDate(1558692000000, 1558648800000)).to.equal(1558692000000);
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

    describe("function for getTime", function () {
        const minutes = moment().minutes(),
            setminutes = minutes < 30 ? 0 : 30;

        it("should return the timestamp without defaults", function () {
            expect(model.getTime()).to.equal(moment().minutes(setminutes).seconds(0).millisecond(0).valueOf());
        });
        it("should return the lower timestamp with defaults", function () {
            expect(model.getTime({hour: 4, minute: 23})).to.equal(moment().hours(4).minutes(0).seconds(0).millisecond(0).valueOf());
        });
        it("should return the upper timestamp with defaults", function () {
            expect(model.getTime({hour: 4, minute: 33})).to.equal(moment().hours(4).minutes(30).seconds(0).millisecond(0).valueOf());
        });
    });

    describe("function for getDate", function () {
        const month = moment().get("month"),
            day = moment().get("date");

        it("should return the timestamp without defaults", function () {
            expect(model.getDate()).to.equal(moment().month(month).date(day).hours(0).minutes(0).seconds(0).millisecond(0).valueOf());
        });
        it("should return the timestamp with defaults", function () {
            expect(model.getDate({month: 6, day: 12})).to.equal(moment().month(6).date(12).hours(0).minutes(0).seconds(0).millisecond(0).valueOf());
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
