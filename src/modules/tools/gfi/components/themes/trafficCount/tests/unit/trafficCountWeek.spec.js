import Vuex from "vuex";
import {shallowMount, createLocalVue, config} from "@vue/test-utils";
import {expect} from "chai";
import trafficCountWeek from "../../components/TrafficCountWeek.vue";
import {addMissingDataWeek} from "../../library/addMissingData.js";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("TrafficCountWeek.vue", () => {
    let wrapper;
    const dummyApi = {
        updateDataset: (thingId, meansOfTransport, timeSettings, onupdate) => {
            onupdate([
                {
                    fahrrad: {
                        "2020-09-07 00:00:00": 1000,
                        "2020-09-08 00:00:00": 4583,
                        "2020-09-09 00:00:00": 300
                    }
                },
                {
                    fahrrad: {
                        "2020-09-21 00:00:00": 4321,
                        "2020-09-22 00:00:00": 2000,
                        "2020-09-23 00:00:00": 3000
                    }
                }
            ]);
        }
    };

    beforeEach(() => {
        wrapper = shallowMount(trafficCountWeek, {
            propsData: {
                api: dummyApi,
                thingId: 5508,
                meansOfTransport: "Anzahl_Fahrraeder"
            },
            localVue
        });
    });

    describe("setDayDatepicker", () => {
        it("should initialize the datepicker", () => {
            wrapper.vm.setWeekdatepicker();

            expect(wrapper.vm.weekDatepicker.attributes.calendarWeeks).to.be.true;
        });
    });

    describe("weekDatepickerValueChanged", () => {
        it("should get the parsed api data", () => {
            const dates = [
                    "2020-09-06T22:00:00.000Z",
                    "2020-09-20T22:00:00.000Z"
                ],
                data = [
                    {
                        fahrrad: addMissingDataWeek("2020-09-07 00:00:00", {
                            "2020-09-07 00:00:00": 1000,
                            "2020-09-08 00:00:00": 4583,
                            "2020-09-09 00:00:00": 300
                        })
                    },
                    {
                        fahrrad: addMissingDataWeek("2020-09-21 00:00:00", {
                            "2020-09-21 00:00:00": 4321,
                            "2020-09-22 00:00:00": 2000,
                            "2020-09-23 00:00:00": 3000
                        })
                    }
                ];

            wrapper.vm.weekDatepickerValueChanged(dates);

            expect(wrapper.vm.apiData).to.deep.equal(data);
        });
    });
});
