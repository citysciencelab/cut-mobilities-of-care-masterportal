import Vue from "vue";
import Vuex from "vuex";
import Vuetify from "vuetify";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import MobilityDataDrawComponent from "../../../components/MobilityDataDraw.vue";
import MobilityDataDraw from "../../../store/MobilityDataDraw";
import {views} from "../../../store/constantsMobilityDataDraw";

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("addons/mobilityDataDraw/components/MobilityDataDraw.vue", () => {
    const mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            mobilityDataDraw: {
                                name:
                                    "translate#additional:modules.tools.mobilityDataDraw.title",
                                glyphicon: "glyphicon-pencil"
                            }
                        }
                    }
                }
            }
        },
        fakeLayer = {
            setStyle: () => {
                /* mocked layer's setStyle function */
            },
            getSource: () => ({
                clear: () => {
                    /* mocked source's clear function */
                }
            })
        };
    let store;

    beforeEach(() => {
        sinon.stub(Radio, "request").callsFake(() => fakeLayer);
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        MobilityDataDraw
                    }
                }
            },
            state: {
                configJson: mockConfigJson,
                Map: {
                    map: {
                        addInteraction: sinon.spy(),
                        removeInteraction: sinon.spy()
                    }
                }
            }
        });
        store.commit("Tools/MobilityDataDraw/setActive", true);
    });

    afterEach(sinon.restore);

    it("renders the MobilityDataDraw tool", () => {
        const wrapper = shallowMount(MobilityDataDrawComponent, {
            store,
            localVue
        });

        expect(wrapper.find("#tool-mobilityDataDraw").exists()).to.be.true;
    });

    it("do not render the MobilityDataDraw tool if not active", () => {
        let wrapper = null;

        store.commit("Tools/MobilityDataDraw/setActive", false);
        wrapper = shallowMount(MobilityDataDrawComponent, {store, localVue});

        expect(wrapper.find("#tool-mobilityDataDraw").exists()).to.be.false;
    });

    it("renders the UI to enter personal data", () => {
        const wrapper = shallowMount(MobilityDataDrawComponent, {
            store,
            localVue,
            stubs: {
                PersonalDataView: true,
                DailyRoutineView: true,
                AnnotationsView: true,
                ClosingView: true
            }
        });

        expect(wrapper.find("#tool-mobilityDataDraw-actions").exists()).to.be
            .true;
        expect(wrapper.find("personaldataview-stub").exists()).to.be.true;
        expect(wrapper.find("dailyroutineview-stub").exists()).to.be.false;
        expect(wrapper.find("annotationsview-stub").exists()).to.be.false;
        expect(wrapper.find("closingview-stub").exists()).to.be.false;
    });

    it("renders the UI for drawing the daily routine mobility data", () => {
        store.commit(
            "Tools/MobilityDataDraw/setView",
            views.DAILY_ROUTINE_VIEW
        );

        const wrapper = shallowMount(MobilityDataDrawComponent, {
            store,
            localVue,
            stubs: {
                PersonalDataView: true,
                DailyRoutineView: true,
                AnnotationsView: true,
                ClosingView: true
            }
        });

        expect(wrapper.find("#tool-mobilityDataDraw-actions").exists()).to.be
            .true;
        expect(wrapper.find("personaldataview-stub").exists()).to.be.false;
        expect(wrapper.find("dailyroutineview-stub").exists()).to.be.true;
        expect(wrapper.find("annotationsview-stub").exists()).to.be.false;
        expect(wrapper.find("closingview-stub").exists()).to.be.false;
    });

    it("renders the UI for drawing annotations", () => {
        store.commit("Tools/MobilityDataDraw/setView", views.ANNOTATIONS_VIEW);

        const wrapper = shallowMount(MobilityDataDrawComponent, {
            store,
            localVue,
            stubs: {
                PersonalDataView: true,
                DailyRoutineView: true,
                AnnotationsView: true,
                ClosingView: true
            }
        });

        expect(wrapper.find("#tool-mobilityDataDraw-actions").exists()).to.be
            .true;
        expect(wrapper.find("personaldataview-stub").exists()).to.be.false;
        expect(wrapper.find("dailyroutineview-stub").exists()).to.be.false;
        expect(wrapper.find("annotationsview-stub").exists()).to.be.true;
        expect(wrapper.find("closingview-stub").exists()).to.be.false;
    });

    it("renders the closing view", () => {
        store.commit("Tools/MobilityDataDraw/setView", views.CLOSING_VIEW);

        const wrapper = shallowMount(MobilityDataDrawComponent, {
            store,
            localVue,
            stubs: {
                PersonalDataView: true,
                DailyRoutineView: true,
                AnnotationsView: true,
                ClosingView: true
            }
        });

        expect(wrapper.find("#tool-mobilityDataDraw-actions").exists()).to.be
            .false;
        expect(wrapper.find("personaldataview-stub").exists()).to.be.false;
        expect(wrapper.find("dailyroutineview-stub").exists()).to.be.false;
        expect(wrapper.find("annotationsview-stub").exists()).to.be.false;
        expect(wrapper.find("closingview-stub").exists()).to.be.true;
    });
});
