// import Vuex from "vuex";
// import {config, shallowMount, createLocalVue} from "@vue/test-utils";
// import FooterComponent from "../../../components/Footer.vue";
// import Footer from "../../../store/indexFooter";
// import {expect} from "chai";

// const localVue = createLocalVue();

// localVue.use(Vuex);
// config.mocks.$t = key => key;

// describe("Footer.vue", () => {
//     const mockConfigJs = {
//         footer: {
//             urls: [],
//             showVersion: false
//         }
//     };
//     let store;

//     beforeEach(() => {
//         store = new Vuex.Store({
//             namespaces: true,
//             modules: {
//                 Footer
//             },
//             state: {
//                 configJs: mockConfigJs
//             }
//         });
//     });

//     it("renders the footer", () => {
//         const wrapper = shallowMount(FooterComponent, {store, localVue});

//         expect(wrapper.find("#footer").exists()).to.be.true;
//     });

//     // it("do not render the footer select if not active", () => {
//     //     store.dispatch("Tools/ScaleSwitcher/setActive", false);
//     //     const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});

//     //     expect(wrapper.find("#scale-switcher").exists()).to.be.false;
//     // });

// });
