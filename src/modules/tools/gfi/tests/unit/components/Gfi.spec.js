import Vuex from "vuex";
import {shallowMount, mount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import GfiComponent from "../../../components/Gfi.vue";
import Mobile from "../../../components/templates/Mobile.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("Gfi.vue", () => {

    it("should find the child component Mobile", () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                isMobile: () => true,
                isActive: () => true,
                gfiFeatures: () => []
            },
            localVue
        });

        expect(wrapper.findComponent({name: "Mobile"}).exists()).to.be.true;
    });

    it("should find the child component Detached", () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                isMobile: () => false,
                isActive: () => true,
                gfiFeatures: () => []
            },
            localVue
        });

        expect(wrapper.findComponent({name: "Detached"}).exists()).to.be.true;
    });

    it("no child component should be found if gfi is not activated", () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                isActive: () => false,
                gfiFeatures: () => []
            },
            localVue
        });

        expect(wrapper.findComponent({name: "Mobile"}).exists()).to.be.false;
        expect(wrapper.findComponent({name: "Detached"}).exists()).to.be.false;
    });

    it("no child component should be found if gfi has no features", async () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                gfiFeatures: () => null
            },
            localVue
        });

        expect(wrapper.findComponent({name: "Mobile"}).exists()).to.be.false;
        expect(wrapper.findComponent({name: "Detached"}).exists()).to.be.false;
    });

    it("the close-event should set pagerIndex to zero and call setGfiFeatures commit", async () => {
        const mockMapMutations = {
                setGfiFeatures: sinon.stub()
            },
            store = new Vuex.Store({
                modules: {
                    Map: {
                        namespaced: true,
                        mutations: mockMapMutations
                    }
                }
            }),
            wrapper = mount(GfiComponent, {
                data () {
                    return {
                        pagerIndex: 1
                    };
                },
                computed: {
                    isMobile: () => true,
                    isActive: () => true,
                    gfiFeatures: () => [{}, {
                        getTheme: () => "default",
                        getTitle: () => "Hallo",
                        "attributesToShow": "showAll",
                        "olFeature": {
                            getProperties: sinon.stub()
                        },
                        "html": null
                    }]
                },
                localVue,
                store
            });


        await wrapper.find(Mobile).vm.$emit("close");
        expect(mockMapMutations.setGfiFeatures.calledOnce).to.be.true;
        expect(wrapper.vm.pagerIndex).to.be.equal(0);
    });
});
