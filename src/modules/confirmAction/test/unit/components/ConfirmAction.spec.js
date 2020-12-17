import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import ConfirmActionStoreModule from "../../../store/indexConfirmAction";
import ConfirmActionComponent from "../../../components/ConfirmAction.vue";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;
config.mocks.$i18n = {
    i18next: {
        options: {
            isEnabled: () => sinon.stub(),
            getLanguages: () => sinon.stub()
        }
    }
};

describe("src/modules/confirmAction/components/ConfirmAction.vue", function () {
    let
        wrapper,
        store;

    beforeEach(() => {
        store = new Vuex.Store({
            modules: {
                ConfirmAction: ConfirmActionStoreModule
            }
        });
    });

    it("Checking Confirm Actions", async function () {
        const
            mountingSettings = {
                store,
                localVue
            },

            testArray = [],

            confirmCallback = function (arr) {
                return function () {
                    arr.push("isConfirmed");
                };
            }(testArray),

            denyCallback = function (arr) {
                return function () {
                    arr.push("isDenied");
                };
            }(testArray),

            confirmActionSettings = {
                actionConfirmedCallback: confirmCallback,
                actionDeniedCallback: denyCallback,
                confirmCaption: "Confirm",
                textContent: "TextContent",
                denyCaption: "Deny",
                forceClickToClose: true,
                headline: "Headline"
            };

        wrapper = shallowMount(ConfirmActionComponent, mountingSettings);

        describe("Triggering a default ConfirmAction", function () {
            it("There is a ConfirmAction container", async function () {
                store.dispatch("ConfirmAction/addSingleAction", confirmActionSettings);
                await wrapper.vm.$nextTick();
                expect(wrapper.findAll("#confirmActionContainer").length).to.equal(1);
            });
        });

        describe("Checking headline and captions", function () {
            it("Headline reads \"Headline\"", function () {
                expect(wrapper.find("#confirmActionContainer h3").exists()).to.be.true;
                expect(wrapper.find("#confirmActionContainer h3").text()).to.equal("Headline");
            });
            it("TextContent reads \"TextContent\"", function () {
                expect(wrapper.find("#confirmActionContainer #confirmation-textContent").exists()).to.be.true;
                expect(wrapper.find("#confirmActionContainer #confirmation-textContent").text()).to.equal("TextContent");
            });
            it("Confirm button reads \"Confirm\"", function () {
                expect(wrapper.find("#confirmActionContainer #modal-button-left").exists()).to.be.true;
                expect(wrapper.find("#confirmActionContainer #modal-button-left").text()).to.equal("Confirm");
            });
            it("Deny button reads \"Deny\"", function () {
                expect(wrapper.find("#confirmActionContainer #modal-button-right").exists()).to.be.true;
                expect(wrapper.find("#confirmActionContainer #modal-button-right").text()).to.equal("Deny");
            });
        });

        describe("Pressing on confirm button", function () {
            it("click", async function () {
                wrapper.find("#confirmActionContainer #modal-button-left").trigger("click");
                await wrapper.vm.$nextTick();
            });
            it("Callback was called", function () {
                expect(testArray[0]).to.equal("isConfirmed");
            });
            it("Confirmation container vanished", async function () {
                expect(wrapper.vm.showTheModal).to.equal(false);
            });
        });
    });
});
