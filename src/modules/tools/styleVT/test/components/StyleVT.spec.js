import {expect} from "chai";
import {createLocalVue, shallowMount} from "@vue/test-utils";
import sinon from "sinon";
import Vuex from "vuex";

import StyleVT from "../../components/StyleVT.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe.only("src/modules/tools/styleVT/components/StyleVT.vue", () => {
    let wrapper,
        wrapperOptions;

    beforeEach(() => {
        wrapperOptions = {
            propsData: {
                vectorTileLayerList: () => []
            }
        };
    });

    afterEach(sinon.restore);

    it("should render a paragraph informing the user that no styleable layers are available if none are", () => {
        wrapper = shallowMount(StyleVT, {wrapperOptions, localVue});

        expect(wrapper.find("#tool-styleVT-noStyleableLayers").exists()).to.be.true;
        expect(wrapper.find("#tool-styleVT-styleableLayersAvailable").exists()).to.be.false;
    });
    it("should render the regular UI if styleable layers are available", () => {
        const layerOne = Symbol(),
            layerTwo = Symbol();

        state.vectorTileLayerList.push(layerOne, layerTwo);
        wrapper = shallowMount(StyleVT, {wrapperOptions, localVue});

        expect(wrapper.find("#tool-styleVT-styleableLayersAvailable").exists()).to.be.true;
        expect(wrapper.find("#tool-styleVT-noStyleableLayers").exists()).to.be.false;
    });
});
