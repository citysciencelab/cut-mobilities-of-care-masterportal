import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import CompareFeatureIcon from "../../../components/CompareFeatureIcon.vue";
import Feature from "ol/Feature";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/favoriteIcons/components/CompareFeatureIcon.vue", () => {
    const olFeature = new Feature({
            isOnCompareList: false
        }),
        vectorLayer = new VectorLayer({
            id: "1234",
            source: new VectorSource()
        });
    let wrapper;

    olFeature.setId("feature1");
    vectorLayer.getSource().addFeature(olFeature);

    beforeEach(() => {
        wrapper = shallowMount(CompareFeatureIcon, {
            propsData: {
                feature: {
                    getId: () => "feature1",
                    getLayerId: () => "1234",
                    getTitle: () => "TestTitle"
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
                            visibleLayerListWithChildrenFromGroupLayers: () => [vectorLayer]
                        }
                    }
                }
            })
        });
    });

    it("should not draw a star by the tool compareFeatures is not configured", () => {
        wrapper = shallowMount(CompareFeatureIcon, {
            propsData: {
                feature: {
                    getId: () => "feature1",
                    getLayerId: () => "1234",
                    getTitle: () => "TestTitle"
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
                            visibleLayerListWithChildrenFromGroupLayers: () => [vectorLayer]
                        }
                    }
                }
            })
        });
        expect(wrapper.find("span").exists()).to.be.false;
    });

    it("should not draw a star by the no olFeature is finding", async () => {
        wrapper.setData({olFeature: null});

        await wrapper.vm.$nextTick();
        expect(wrapper.find("span").exists()).to.be.false;
    });

    it("should draw a star by the tool compareFeatures is configured", () => {
        expect(wrapper.find("span").exists()).to.be.true;
    });

    it("should render empty star buttons by first start gfi", () => {
        expect(wrapper.find("span").classes("glyphicon-star-empty")).to.be.true;
        expect(wrapper.find("span").classes("glyphicon-star")).to.be.false;
        expect(wrapper.find("span").attributes().title).equals("modules.tools.gfi.favoriteIcons.compareFeatureIcon.toCompareList");
    });

    it("should render star button if featureIsOnCompareList is true", async () => {
        wrapper.setData({featureIsOnCompareList: true});

        await wrapper.vm.$nextTick();
        expect(wrapper.find("span").classes("glyphicon-star-empty")).to.be.false;
        expect(wrapper.find("span").classes("glyphicon-star")).to.be.true;
        expect(wrapper.find("span").attributes().title).equals("modules.tools.gfi.favoriteIcons.compareFeatureIcon.fromCompareList");
    });
});
