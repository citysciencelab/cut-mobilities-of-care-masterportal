import Vuex from "vuex";
import {expect} from "chai";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import * as crs from "masterportalAPI/src/crs";
import SearchByCoordComponent from "../../../components/SearchByCoord.vue";
import SearchByCoord from "../../../store/indexSearchByCoord";

const localVue = createLocalVue(),
    namedProjections = [
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ];

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/supplyCoord/components/SearchByCoord.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        searchByCoord:
                            {
                                "name": "translate#common:menu.tools.searchByCoord",
                                "glyphicon": "glyphicon-record",
                                "renderToWindow": true
                            }
                    }
                }
            }
        }
    };
    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        SearchByCoord
                    }
                },
                Map: {
                    namespaced: true
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        crs.registerProjections(namedProjections);
    });

    it("renders SearchByCoord", () => {
        store.commit("Tools/SearchByCoord/setActive", true);
        wrapper = shallowMount(SearchByCoordComponent, {store, localVue});

        expect(wrapper.find("#search-by-coord").exists()).to.be.true;
    });

    it("not renders SearchByCoord", () => {
        store.commit("Tools/SearchByCoord/setActive", false);
        wrapper = shallowMount(SearchByCoordComponent, {store, localVue});

        expect(wrapper.find("#search-by-coord").exists()).to.be.false;
    });
    describe("SearchByCoord.vue methods", () => {
        it("close sets active to false", async () => {
            wrapper = shallowMount(SearchByCoordComponent, {store, localVue});

            wrapper.vm.close();
            await wrapper.vm.$nextTick();

            expect(store.state.Tools.SearchByCoord.active).to.be.false;
            expect(wrapper.find("#supply-coord").exists()).to.be.false;
        });
    });
});
