import Vuex from "vuex";
import {shallowMount, createLocalVue, config} from "@vue/test-utils";
import {expect} from "chai";
import traffiCount from "../../components/TrafficCount.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("TraffiCount.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(traffiCount, {
            propsData: {
                feature: {
                    getProperties: function () {
                        return {
                            "geometry": {},
                            "topic": "Transport und Verkehr",
                            "assetID": "F_6.1_2",
                            "name": "Zählfeld F_6.1_2",
                            "@iot.id": 5508,
                            "Datastreams": [
                                {
                                    "properties":
                                        {
                                            infoLastUpdate: "2020-08-06T07:31:32.880Z",
                                            layerName: "Anzahl_Fahrraeder_Zaehlfeld_15-Min",
                                            mediaMonitored: "transport",
                                            namespace: "https://registry.gdi-de.org/id/de.hh/292eac0c-b8ab-44ce-a31d-f547ba929d37",
                                            ownerData: "Freie und Hansestadt Hamburg",
                                            resultNature: "processed",
                                            serviceName: "HH_STA_HamburgerRadzaehlnetz"
                                        }
                                }
                            ],
                            "requestUrl": "test://api",
                            "versionUrl": "1.0"
                        };
                    }
                }
            },
            computed: {
                currentLocale: () => "de"
            },
            localVue
        });
    });

    describe("getMeansOfTransportFromDatastream", () => {
        it("returns the means of transportation from data stream", () => {
            const result = wrapper.vm.getMeansOfTransportFromDatastream(wrapper.vm.feature.getProperties().Datastreams, Object.keys(wrapper.vm.typeAssoc));

            expect(result).to.equal("Anzahl_Fahrraeder");
        });
    });

    describe("createDataConnection", () => {
        it("returns the means of transportation from data stream", () => {
            wrapper.vm.createDataConnection(wrapper.vm.feature.getProperties(), "sensorThingsApiOpt");

            expect(wrapper.vm.propThingId).to.equal(5508);
            expect(wrapper.vm.propMeansOfTransport).to.equal("Anzahl_Fahrraeder");
        });
    });

    describe("header text", () => {
        it("show the header title", () => {
            wrapper.vm.createDataConnection(wrapper.vm.feature.getProperties(), {
                updateTitle: (thingId, setter) => {
                    setter("title");
                },
                updateDirection: (thingId, setter) => {
                    setter("direction");
                }
            });
            wrapper.vm.setHeader(wrapper.vm.api, wrapper.vm.propThingId, wrapper.vm.propMeansOfTransport);
            expect(wrapper.vm.meansOfTransport).to.equal(wrapper.vm.meansOfTransportAssoc.Anzahl_Fahrraeder);
            expect(wrapper.vm.type).to.equal(wrapper.vm.typeAssoc.Anzahl_Fahrraeder);
            expect(wrapper.vm.title).to.equal("title");
            expect(wrapper.vm.direction).to.equal("direction");
        });

        it("show the errors", () => {
            wrapper.vm.createDataConnection(wrapper.vm.feature.getProperties(), {
                updateTitle: (thingId, setter, onerror) => {
                    onerror("errormsg");
                },
                updateDirection: (thingId, setter, onerror) => {
                    onerror("errormsg");
                }
            });
            wrapper.vm.setHeader(wrapper.vm.api, wrapper.vm.propThingId, wrapper.vm.propMeansOfTransport);
            expect(wrapper.vm.title).to.equal("(kein Titel empfangen)");
            expect(wrapper.vm.direction).to.equal("");
        });
    });

    describe("setCurrentTabId", () => {
        it("returns the current tab id after clicking the tab", async () => {
            const tab = wrapper.find(".nav-pills");

            await tab.trigger("click");
            expect(wrapper.vm.currentTabId).to.equal("infos");
        });
    });

    describe("setComponentKey", () => {
        it("returns the key for child components", () => {
            wrapper.vm.setComponentKey("de");
            expect(wrapper.vm.keyInfo).to.equal("deinfo");
            expect(wrapper.vm.keyDay).to.equal("deday");
            expect(wrapper.vm.keyWeek).to.equal("deweek");
            expect(wrapper.vm.keyYear).to.equal("deyear");
        });
    });
});
