import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import RoutingIcon from "../../../components/RoutingIcon.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/favoriteIcons/components/RoutingIcon.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(RoutingIcon, {
            propsData: {
                feature: {
                }
            },
            methods: {
                componentExists: () => true
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            },
            store: new Vuex.Store({
                namespaces: true,
                modules: {
                    Map: {
                        namespaced: true,
                        getters: {
                            visibleLayerListWithChildrenFromGroupLayers: () => [1, 2]
                        }
                    }
                }
            })
        });
    });

    it("should not draw a star by the tool compareFeatures is not configured", () => {
        wrapper = shallowMount(RoutingIcon, {
            propsData: {
                feature: {
                }
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            },
            store: new Vuex.Store({
                namespaces: true,
                modules: {
                    Map: {
                        namespaced: true,
                        getters: {
                            clickCoord: () => [1, 2]
                        }
                    }
                }
            })
        });
        expect(wrapper.find("span").exists()).to.be.false;
    });

    it("should draw a glyphicon by the tool routing is configured", () => {
        expect(wrapper.find("span").exists()).to.be.true;
    });

    it("should render glyphicon and title by start gfi", () => {
        expect(wrapper.find("span").classes("glyphicon-road")).to.be.true;
        expect(wrapper.find("span").attributes().title).equals("modules.tools.gfi.favoriteIcons.routingicon.routingDestination");
    });
});
