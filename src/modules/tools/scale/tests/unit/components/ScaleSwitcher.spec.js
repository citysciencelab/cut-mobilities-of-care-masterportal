import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import ScaleSwitcherComponent from "../../../components/ScaleSwitcher.vue";
import ScaleSwitcher from "../../../store/indexScaleSwitcher";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("ScaleSwitcher.vue", () => {
    const scales = ["1000", "5000", "10000"],
        mockMapGetters = {
            scales: () => scales,
            scale: sinon.stub(),
            getView: sinon.stub()
        },
        mockMapActions = {
            setResolutionByIndex: sinon.stub()
        },
        mockMapMutations = {
            setScale: sinon.stub()
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            scaleSwitcher:
                            {
                                "name": "translate#common:menu.tools.scaleSwitcher",
                                "glyphicon": "glyphicon-resize-full",
                                "renderToWindow": true
                            }
                        }
                    }
                }
            }
        };
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        ScaleSwitcher
                    }
                },
                Map: {
                    namespaced: true,
                    getters: mockMapGetters,
                    mutations: mockMapMutations,
                    actions: mockMapActions
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.dispatch("Tools/ScaleSwitcher/setActive", true);
    });

    it("renders the scaleSwitcher", () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});

        expect(wrapper.find("#scale-switcher").exists()).to.be.true;
    });

    it("do not render the scaleSwitchers select if not active", () => {
        store.dispatch("Tools/ScaleSwitcher/setActive", false);
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});

        expect(wrapper.find("#scale-switcher").exists()).to.be.false;
    });

    it("has initially set all scales to select", () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue}),
            options = wrapper.findAll("option");

        expect(options.length).to.equal(scales.length);
        scales.forEach((scale, index) => {
            expect(scale).to.equal(options.at(index).attributes().value);
        });
    });

    it("has initially selected current scale", async () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue}),
            options = wrapper.findAll("option");

        // now the map sets it scale and the ScaleSwitcher watches for it and sets it currentScale
        store.commit("Tools/ScaleSwitcher/setCurrentScale", scales[1]);
        await wrapper.vm.$nextTick();
        // the option should be selected
        expect(options.at(1).attributes().selected).to.equals("true");
    });

    it("select another scale changes scale in map", async () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue}),
            options = wrapper.findAll("option");

        options.at(1).trigger("change");
        await wrapper.vm.$nextTick();
        expect(options.at(1).attributes().selected).to.equals("true");
        expect(options.at(0).attributes().selected).to.be.undefined;
        expect(options.at(2).attributes().selected).to.be.undefined;
        // maps scale change should be called
        expect(mockMapActions.setResolutionByIndex.calledOnce).to.equal(true);

        options.at(2).trigger("change");
        await wrapper.vm.$nextTick();
        expect(options.at(2).attributes().selected).to.equals("true");
        // maps scale change should be called
        expect(mockMapActions.setResolutionByIndex.calledTwice).to.equal(true);
    });

    it("has initially selected current scale", async () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue}),
            options = wrapper.findAll("option");

        // now the map sets it scale and the ScaleSwitcher watches for it and sets it currentScale
        store.commit("Tools/ScaleSwitcher/setCurrentScale", scales[1]);
        await wrapper.vm.$nextTick();
        // the option should be selected
        expect(options.at(1).attributes().selected).to.equals("true");
    });

    it("method selectionChanged shall change currentScale", async () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue}),
            event = {
                target: {
                    value: scales[1],
                    selectedIndex: 1
                }
            };

        wrapper.vm.selectionChanged(event);
        await wrapper.vm.$nextTick();

        expect(store.state.Tools.ScaleSwitcher.currentScale).to.equals(scales[1]);
    });

    it("method close sets active to false", async () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});

        wrapper.vm.close();
        await wrapper.vm.$nextTick();

        expect(store.state.Tools.ScaleSwitcher.active).to.be.false;
        expect(wrapper.find("#scale-switcher").exists()).to.be.false;
    });


});
