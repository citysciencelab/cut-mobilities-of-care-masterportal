import Vuex from "vuex";
import {config, createLocalVue, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import PoiOrientationComponent from "../../../../components/poi/PoiOrientation.vue";
import LinestringStyle from "../../../../../../../../modules/vectorStyle/linestringStyle.js";
import PointStyle from "../../../../../../../../modules/vectorStyle/pointStyle.js";
import PolygonStyle from "../../../../../../../../modules/vectorStyle/polygonStyle.js";
import Feature from "ol/Feature.js";
import {Circle} from "ol/geom.js";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/controls/orientation/components/PoiOrientation.vue", () => {
    const mockConfigJson = {
            Portalconfig: {
                menu: {
                    "controls":
                        {
                            "orientation":
                                {
                                    "zoomMode": "once",
                                    "poiDistances":
                                        [
                                            1000,
                                            5000,
                                            10000
                                        ]
                                }

                        }
                }
            }
        },

        mockGetters = {
            showPoi: () => true,
            position: () => [565650.509295172, 5934218.137240716],
            activeCategory: () => "1000"
        };

    let store,
        propsData,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                controls: {
                    namespaced: true,
                    modules: {
                        orientation: {
                            namespaced: true,
                            getters: mockGetters,
                            mutations: {
                                setActiveCategory: () => sinon.stub()
                            }
                        }
                    },
                    state: {
                        configJson: mockConfigJson
                    }
                }
            }
        });

        propsData = {
            poiDistances: [
                1000,
                5000,
                10000
            ],
            getFeaturesInCircle: (distance, centerPosition) => {
                const circle = new Circle(centerPosition, distance),
                    circleExtent = circle.getExtent(),
                    visibleWFSLayers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"});
                let featuresAll = [],
                    features = [];

                if (!Array.isArray(visibleWFSLayers) || !visibleWFSLayers.length) {
                    return [];
                }
                visibleWFSLayers.forEach(layer => {
                    if (layer.has("layerSource") === true) {
                        features = layer.get("layerSource").getFeaturesInExtent(circleExtent);
                        features.forEach(function (feat) {
                            Object.assign(feat, {
                                styleId: layer.get("styleId"),
                                layerName: layer.get("name"),
                                dist2Pos: this.getDistance(feat, centerPosition)
                            });
                        }, this);
                        featuresAll = this.union(features, featuresAll, function (obj1, obj2) {
                            return obj1 === obj2;
                        });
                    }
                }, this);

                return featuresAll;
            }
        };

        wrapper = shallowMount(PoiOrientationComponent, {
            store,
            propsData: propsData,
            localVue
        });
    });

    describe("Render Component", function () {
        it("renders the Poi Orientation component", () => {
            expect(wrapper.find("#surrounding_vectorfeatures").exists()).to.be.true;
            expect(wrapper.find(".modal-backdrop").exists()).to.be.true;
        });
    });

    describe("getFeatureTitle", function () {
        let feature = new Feature();

        it("should return layerName when name is unset", function () {
            feature = Object.assign(feature, {
                layerName: "LayerName"
            });
            expect(wrapper.vm.getFeatureTitle(feature)).to.be.an("array").to.deep.equal(["LayerName"]);
        });
        it("should return name when set", function () {
            feature.set("name", "Name");
            expect(wrapper.vm.getFeatureTitle(feature)).to.be.an("array").to.deep.equal(["Name"]);
        });
        it("should return nearby title text when set", function () {
            feature = Object.assign(feature, {
                nearbyTitleText: ["nearbyTitleText"]
            });
            expect(wrapper.vm.getFeatureTitle(feature)).to.be.an("array").to.deep.equal(["nearbyTitleText"]);
        });
    });

    describe("SVG Functions", function () {
        it("createPolygonSVG should return an SVG", function () {
            const style = new PolygonStyle();

            expect(wrapper.vm.createPolygonSVG(style)).to.be.an("string").to.equal("<svg height='35' width='35'><polygon points='5,5 30,5 30,30 5,30' style='fill:#0ac864;fill-opacity:0.5;stroke:#000000;stroke-opacity:1;stroke-width:1;'/></svg>");
        });
        it("createLineSVG should return an SVG", function () {
            const style = new LinestringStyle();

            expect(wrapper.vm.createLineSVG(style)).to.be.an("string").to.equal("<svg height='35' width='35'><path d='M 05 30 L 30 05' stroke='#ff0000' stroke-opacity='1' stroke-width='5' fill='none'/></svg>");
        });
        it("createCircleSVG should return an SVG", function () {
            const style = new PointStyle();

            expect(wrapper.vm.createCircleSVG(style)).to.be.an("string").to.equal("<svg height='35' width='35'><circle cx='17.5' cy='17.5' r='15' stroke='#000000' stroke-opacity='1' stroke-width='2' fill='#0099ff' fill-opacity='1'/></svg>");
        });
    });
});
