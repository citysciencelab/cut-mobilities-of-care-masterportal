import {expect} from "chai";
import {createLocalVue, shallowMount} from "@vue/test-utils";
import sinon from "sinon";
import Vuex from "vuex";

import StyleVT from "../../store/indexStyleVT";
import StyleVTComponent from "../../components/StyleVT.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/styleVT/components/StyleVT.vue", () => {
    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        StyleVT
                    }
                }
            }
        });
        store.commit("Tools/StyleVT/setActive", true);
    });

    afterEach(sinon.restore);

    it("should render a paragraph informing the user that no styleable layers are available if none are", () => {
        wrapper = shallowMount(StyleVTComponent, {store, localVue});

        expect(wrapper.find("#tool-styleVT-noStyleableLayers").exists()).to.be.true;
        expect(wrapper.find("#tool-styleVT-styleableLayersAvailable").exists()).to.be.false;
    });
    it("should render the regular UI if styleable layers are available", () => {
        const layerOne = Symbol(),
            layerTwo = Symbol();

        store.commit("Tools/StyleVT/setVectorTileLayerList", [layerOne, layerTwo]);
        wrapper = shallowMount(StyleVTComponent, {store, localVue});

        expect(wrapper.find("#tool-styleVT-styleableLayersAvailable").exists()).to.be.true;
        expect(wrapper.find("#tool-styleVT-noStyleableLayers").exists()).to.be.false;
    });
});
