import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import DefaultTheme from "../../../components/themes/Default.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/Default.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(DefaultTheme, {
            propsData: {
                feature: {
                    getMappedProperties: function () {
                        return {
                            phone_number: "+49123 456-789",
                            phonenumber_2: "040/123456",
                            phonenumber3: "+040gg/123456",
                            phonenumber4: "49 123456",
                            phonenumber5: "+43123456",
                            url: "https",
                            url2: "file",
                            Test_String: "Hallo Welt"
                        };
                    }
                }
            },
            localVue
        });
    });

    it("should render a table with class 'table", () => {
        expect(wrapper.find("table").exists()).to.be.true;
        expect(wrapper.classes("table")).to.be.true;
    });

    it("should render table headers without underscore", () => {
        wrapper.findAll("th").wrappers.forEach(function (th) {
            expect(th.text().search("_")).to.be.equal(-1);
        });
    });

    it("should always upper case the first letter in the table headers", () => {
        wrapper.findAll("th").wrappers.forEach(function (th) {
            expect(th.text().charAt(0) === th.text().charAt(0).toUpperCase()).to.be.true;
        });
    });

    it("should link all properties as phone number if the property starts with '+[xx]' (x = any Number)", () => {
        wrapper.findAll("a[href^='tel']").wrappers.forEach(function (a) {
            expect(a.attributes("href")).to.have.string("tel:");
        });
    });

    it("should remove minus in all linked phone numbers", () => {
        wrapper.findAll("a[href^='tel']").wrappers.forEach(function (a) {
            expect(a.attributes("href").search("-")).to.be.equal(-1);
        });
    });

    it("should remove blanks in all linked phone numbers", () => {
        wrapper.findAll("a[href^='tel']").wrappers.forEach(function (a) {
            expect(a.attributes("href").search(" ")).to.be.equal(-1);
        });
    });

    it("should render all urls as 'Link'", () => {
        wrapper.findAll("a[target='_blank']").wrappers.forEach(function (a) {
            expect(a.text()).to.be.equal("Link");
        });
    });

    it("should render all properties as email if the property contains an @", () => {
        wrapper.findAll("a[href^=mailto]").wrappers.forEach(a => {
            expect(a.attributes("href")).to.have.string("@");
        });
    });

});
