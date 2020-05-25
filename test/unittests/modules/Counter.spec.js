import "core-js/stable";
import "regenerator-runtime/runtime";
import {mount} from "@vue/test-utils";
import Counter from "../ExampleTest/Counter.vue";
import {expect} from "chai";

describe("Counter", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(Counter);
    });

    it("defaults to a count of 0", () => {
        expect(wrapper.vm.count).to.equal(0);
    });

    it("renders the correct markup", () => {
        expect(wrapper.html()).to.contain("<span class=\"count\">0</span>");
    });

    it("has a button", () => {
        expect(wrapper.find("button")).to.be.an("object");
    });

    it("button click should increment the count text", async () => {
        expect(wrapper.text()).to.contain("0");
        const button = wrapper.find("button");

        await button.trigger("click");
        expect(wrapper.text()).to.contain("1");
    });

});
