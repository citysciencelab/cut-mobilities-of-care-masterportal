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

    it("no child component should be found if gfi has no features", () => {
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
                    gfiFeatures: () => [{
                        getTheme: () => "default",
                        getTitle: () => "Hallo",
                        "attributesToShow": "showAll",
                        "olFeature": {
                            getProperties: sinon.stub()
                        },
                        "html": null
                    },
                    {
                        getTheme: () => "default",
                        getTitle: () => "Hallo2",
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

        await wrapper.findComponent(Mobile).vm.$emit("close");
        expect(mockMapMutations.setGfiFeatures.calledOnce).to.be.true;
        expect(wrapper.vm.pagerIndex).to.equal(0);
    });

    it("should display the footer", () => {
        const wrapper = mount(GfiComponent, {
            computed: {
                isMobile: () => true,
                isActive: () => true,
                gfiFeatures: () => [{
                    getTheme: () => "default",
                    getTitle: () => "Feature 1",
                    "attributesToShow": "showAll",
                    "olFeature": {
                        getProperties: sinon.stub()
                    },
                    "html": null
                },
                {}]
            },
            localVue
        });

        expect(wrapper.find(".pager-left").exists()).to.be.true;
        expect(wrapper.find(".pager-right").exists()).to.be.true;
    });

    it("should display the next feature if pager-right is clicked", async () => {
        const wrapper = mount(GfiComponent, {
            computed: {
                isMobile: () => true,
                isActive: () => true,
                gfiFeatures: () => [{
                    getTheme: () => "default",
                    getTitle: () => "Feature 1",
                    "attributesToShow": "showAll",
                    "olFeature": {
                        getProperties: sinon.stub()
                    },
                    "html": null
                },
                {
                    getTheme: () => "default",
                    getTitle: () => "Feature 2",
                    "attributesToShow": "showAll",
                    "olFeature": {
                        getProperties: sinon.stub()
                    },
                    "html": null
                }]
            },
            localVue
        });

        await wrapper.find(".pager-right").trigger("click");
        expect(wrapper.find(".modal-title").text()).to.equal("Feature 2");
    });

    it("should display the previous feature if pager-left is clicked", async () => {
        const wrapper = mount(GfiComponent, {
            computed: {
                isMobile: () => true,
                isActive: () => true,
                gfiFeatures: () => [{
                    getTheme: () => "default",
                    getTitle: () => "Feature 1",
                    "attributesToShow": "showAll",
                    "olFeature": {
                        getProperties: sinon.stub()
                    },
                    "html": null
                },
                {
                    getTheme: () => "default",
                    getTitle: () => "Feature 2",
                    "attributesToShow": "showAll",
                    "olFeature": {
                        getProperties: sinon.stub()
                    },
                    "html": null
                }]
            },
            localVue
        });

        wrapper.setData({pagerIndex: 1});
        await wrapper.find(".pager-left").trigger("click");
        expect(wrapper.find(".modal-title").text()).to.equal("Feature 1");
    });

    it("should disabled left pager if pagerIndex is zero", () => {
        const wrapper = mount(GfiComponent, {
            computed: {
                isMobile: () => true,
                isActive: () => true,
                gfiFeatures: () => [{
                    getTheme: () => "default",
                    getTitle: () => "Feature 1",
                    "attributesToShow": "showAll",
                    "olFeature": {
                        getProperties: sinon.stub()
                    },
                    "html": null
                },
                {}]
            },
            localVue
        });

        expect(wrapper.find(".pager-left").classes("disabled")).to.be.true;
    });

    it("should enabled right pager if pagerIndex is zero", () => {
        const wrapper = mount(GfiComponent, {
            computed: {
                isMobile: () => true,
                isActive: () => true,
                gfiFeatures: () => [{
                    getTheme: () => "default",
                    getTitle: () => "Feature 1",
                    "attributesToShow": "showAll",
                    "olFeature": {
                        getProperties: sinon.stub()
                    },
                    "html": null
                },
                {}]
            },
            localVue
        });

        expect(wrapper.find(".pager-right").classes("disabled")).to.be.false;
    });

    it("should disabled right pager if pagerIndex === gfiFeatures.length - 1", () => {
        const wrapper = mount(GfiComponent, {
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
                    getTitle: () => "Feature 1",
                    "attributesToShow": "showAll",
                    "olFeature": {
                        getProperties: sinon.stub()
                    },
                    "html": null
                }]
            },
            localVue
        });

        expect(wrapper.find(".pager-right").classes("disabled")).to.be.true;
    });

    it("should enable left pager if pagerIndex === gfiFeatures.length - 1", () => {
        const wrapper = mount(GfiComponent, {
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
                    getTitle: () => "Feature 1",
                    "attributesToShow": "showAll",
                    "olFeature": {
                        getProperties: sinon.stub()
                    },
                    "html": null
                }]
            },
            localVue
        });

        expect(wrapper.find(".pager-left").classes("disabled")).to.be.false;
    });


    it("should enable left pager and right pager if pagerIndex is between zero and gfiFeature.length - 1", () => {
        const wrapper = mount(GfiComponent, {
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
                    getTitle: () => "Feature 1",
                    "attributesToShow": "showAll",
                    "olFeature": {
                        getProperties: sinon.stub()
                    },
                    "html": null
                }, {}]
            },
            localVue
        });

        expect(wrapper.find(".pager-left").classes("disabled")).to.be.false;
        expect(wrapper.find(".pager-right").classes("disabled")).to.be.false;
    });
});
