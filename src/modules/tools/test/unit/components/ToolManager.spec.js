import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import ToolManagerComponent from "../../../ToolManager.vue";
import Tools from "../../../indexTools";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("ToolManager.vue", () => {
    const mochMenuConfig = {
            tools: {
                children: {
                    scaleSwitcher:                             {
                        "name": "translate#common:menu.tools.scaleSwitcher",
                        "glyphicon": "glyphicon-resize-full",
                        "renderToWindow": true
                    }
                }
            },
            supplyCoord: {
                "name": "translate#common:menu.tools.supplyCoord",
                "glyphicon": "glyphicon-screenshot",
                "renderToWindow": true
            }
        },
        mockConfigJson = {
            Portalconfig: {
                menu: mochMenuConfig
            }
        },
        mockMenuGetters = {
            menuConfig: () => mochMenuConfig
        };
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools
            },
            state: {
                configJson: mockConfigJson,
                menuConfig: mockMenuGetters
            }
            // menuConfig: {
            //     getters: mockMenuGetters
            // }
            // getters: {
            //     menuConfig: mockMenuGetters,
            //     toolsConfig: sinon.stub()
            // }
        });
    });

    it("get the configured tools", () => {
        console.log("---------------------------------------------------------");
// console.log(store);

        const wrapper = shallowMount(ToolManagerComponent, {store, localVue});

        console.log(wrapper.computed.configuredTools());

        expect(wrapper.computed.configuredTools().to.be.an("array"));
    });


});
