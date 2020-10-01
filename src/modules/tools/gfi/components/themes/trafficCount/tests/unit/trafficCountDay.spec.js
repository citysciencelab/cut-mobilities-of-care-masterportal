import Vuex from "vuex";
import {shallowMount, createLocalVue, config} from "@vue/test-utils";
import {expect} from "chai";
import trafficCountDay from "../../components/TrafficCountDay.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("TraffiCountInfo.vue", () => {
    let wrapper;
    const dummyApi = {
        updateDataset: (thingId, meansOfTransport, timeSettings, datasets) => {
            datasets([
                {
                    fahrrad: {
                        "2020-09-22 00:00:00": 3000,
                        "2020-09-22 00:15:00": 4583,
                        "2020-09-22 00:30:00": 300
                    }
                },
                {
                    fahrrad: {
                        "2020-09-21 00:00:00": 1234,
                        "2020-09-21 00:15:00": 432,
                        "2020-09-21 00:30:00": 3111
                    }
                }
            ]);
        }
    };

    beforeEach(() => {
        wrapper = shallowMount(trafficCountDay, {
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
            wrapper.vm.setDayDatepicker();

            expect(wrapper.vm.dayDatepicker.attributes.multidate).to.equal(5);
        });
    });

    describe("dayDatepickerValueChanged", () => {
        it("should get the parsed api data", () => {
            const dates = [
                    "2020-09-21T22:00:00.000Z",
                    "2020-09-22T22:00:00.000Z"
                ],
                data = [
                    {
                        fahrrad: {
                            "2020-09-22 00:00:00": 3000,
                            "2020-09-22 00:15:00": 4583,
                            "2020-09-22 00:30:00": 300
                        }
                    },
                    {
                        fahrrad: {
                            "2020-09-21 00:00:00": 1234,
                            "2020-09-21 00:15:00": 432,
                            "2020-09-21 00:30:00": 3111
                        }
                    }
                ];

            wrapper.vm.dayDatepickerValueChanged(dates);

            expect(wrapper.vm.apiData).to.deep.equal(data);
        });
    });
});
