import {config, mount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import ToggleCheckboxComponent from "../../../share-components/ToggleCheckbox.vue";
import sinon from "sinon";

const localVue = createLocalVue();

config.mocks.$t = key => key;

describe("src/share-components/ToggleCheckbox.vue", () => {
    it("should have the correct Labels and correct active class for active state", () => {
        const wrapper = mount(ToggleCheckboxComponent, {
                propsData: {
                    defaultState: true
                },
                localVue
            }),
            labelTags = wrapper.findAll("label");

        expect(labelTags.at(0).text()).to.be.equal("on");
        expect(labelTags.at(1).text()).to.be.equal("off");
        expect(labelTags.at(0).classes().indexOf("active")).not.to.equal(-1);
        expect(labelTags.at(1).classes().indexOf("active")).to.equal(-1);
    });

    it("should have the correct classes for inactive state", async () => {
        const wrapper = mount(ToggleCheckboxComponent, {
                propsData: {
                    defaultState: false
                },
                localVue
            }),
            labelTags = wrapper.findAll("label");

        expect(labelTags.at(0).classes().indexOf("active")).to.equal(-1);
        expect(labelTags.at(1).classes().indexOf("active")).not.to.equal(-1);
    });

    it("should call toggle if label is clicked", async () => {
        const spyToggle = sinon.spy(ToggleCheckboxComponent.methods, "toggle"),
            wrapper = mount(ToggleCheckboxComponent, {
                propsData: {
                    defaultState: false
                },
                localVue
            }),
            labelTags = wrapper.findAll("label");

        await labelTags.at(0).trigger("click");
        expect(spyToggle.calledOnce).to.be.true;
        await labelTags.at(1).trigger("click");
        expect(spyToggle.calledTwice).to.be.true;

        spyToggle.restore();
    });

});
