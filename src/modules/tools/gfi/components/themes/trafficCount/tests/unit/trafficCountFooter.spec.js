import Vuex from "vuex";
import {shallowMount, createLocalVue, config} from "@vue/test-utils";
import {expect} from "chai";
import trafficCountFooter from "../../components/TrafficCountFooter.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/gfi/components/themes/trafficCount/components/trafficCountFooter.vue", () => {
    let wrapper;
    const dummyApi = {
        updateTotal: (thingId, meansOfTransport, onupdate) => {
            onupdate("2020-03-17", "foo");
        },
        updateYear: (thingId, meansOfTransport, year, onupdate) => {
            onupdate("2020", "bar");
        },
        updateDay: (thingId, meansOfTransport, date, onupdate) => {
            onupdate("2020-02-17", "baz");
        },
        updateHighestWorkloadDay: (thingId, meansOfTransport, year, onupdate) => {
            onupdate("2020-01-17", "qox");
        },
        updateHighestWorkloadWeek: (thingId, meansOfTransport, year, onupdate) => {
            onupdate("calendarWeek", "quix");
        },
        updateHighestWorkloadMonth: (thingId, meansOfTransport, year, onupdate) => {
            onupdate("month", "foobar");
        },
        subscribeLastUpdate: (thingId, meansOfTransport, onupdate) => {
            onupdate("2020-03-22T00:00:00.000Z");
        },
        downloadData: (thingId, meansOfTransport, timeSettings, onsuccess) => {
            onsuccess({
                title: "title",
                data: []
            });
        }
    };

    beforeEach(() => {
        wrapper = shallowMount(trafficCountFooter, {
            propsData: {
                currentTabId: "infos",
                api: dummyApi,
                thingId: 5508,
                meansOfTransport: "Anzahl_Fahrraeder"
            },
            localVue
        });
    });

    describe("setFooterLastUpdate", function () {
        it("should return the last update time", function () {

            expect(wrapper.vm.lastUpdate).to.equal("22.03.2020, 00:00:00");
        });
    });

    describe("prepareDataForDownload", function () {
        it("should return the prepared data for the csv download", function () {
            const obj = {
                    "2020-06-23 00:00:01": 0.16,
                    "2020-06-23 00:15:01": 0.07,
                    "2020-06-23 00:30:01": 0.13,
                    "2020-06-23 00:45:01": 0.15
                },
                dataDay = wrapper.vm.prepareDataForDownload(obj, "day"),
                dataWeek = wrapper.vm.prepareDataForDownload(obj, "week"),
                dataYear = wrapper.vm.prepareDataForDownload(obj, "year");

            expect(dataDay[0]).to.have.all.keys("Datum", "Uhrzeit von", "Anzahl");
            expect(dataDay[0].Datum).to.equal("2020-06-23");
            expect(dataDay[1]["Uhrzeit von"]).to.equal("00:15");
            expect(dataDay[2].Anzahl).to.equal(0.13);

            expect(dataWeek[0]).to.have.all.keys("Datum", "Anzahl");
            expect(dataWeek[0].Datum).to.equal("2020-06-23");
            expect(dataWeek[2].Anzahl).to.equal(0.13);

            expect(dataYear[0]).to.have.all.keys("Kalenderwoche ab", "Anzahl");
            expect(dataYear[0]["Kalenderwoche ab"]).to.equal("2020-06-23");
            expect(dataYear[2].Anzahl).to.equal(0.13);
        });
    });

    describe("updateFooter", function () {
        wrapper = shallowMount(trafficCountFooter, {
            propsData: {
                currentTabId: "day",
                api: dummyApi,
                thingId: 5508,
                meansOfTransport: "Anzahl_Fahrraeder"
            },
            localVue
        });

        it("should return the last update time", function () {
            expect(wrapper.vm.lastUpdate).to.equal("22.03.2020, 00:00:00");
        });

        it("should return some attributes from snippet exportButton", function () {
            expect(wrapper.vm.exportModel.attributes.disabled).to.be.false;
            expect(wrapper.vm.exportModel.attributes.rawData).to.deep.equal([]);
        });
    });
});
