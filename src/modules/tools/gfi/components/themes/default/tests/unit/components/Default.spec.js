import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import DefaultTheme from "../../../components/Default.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/default/components/Default.vue", () => {
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
                            Test_String: "Hallo Welt",
                            emptyValue: "",
                            undefinedValue: undefined,
                            testBrTag: "moin<br>123"
                        };
                    },
                    getProperties: function () {
                        return {
                            bildlink: "https://test.png"
                        };
                    },
                    getTheme: function () {
                        return "images";
                    },
                    getGfiUrl: () => "http",
                    getMimeType: () => "text/xml"
                }
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });
    });

    it("should render a table with class 'table", () => {
        expect(wrapper.find("table").exists()).to.be.true;
        expect(wrapper.find("table").classes("table")).to.be.true;
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
        wrapper.find("table").findAll("a[target='_blank']").wrappers.forEach(function (a) {
            expect(a.text()).to.be.equal("Link");
        });
    });

    it("should render all properties as email if the property contains an @", () => {
        wrapper.findAll("a[href^=mailto]").wrappers.forEach(a => {
            expect(a.attributes("href")).to.have.string("@");
        });
    });

    it("should the value as html if the value includes the tag <br>", () => {
        const countTdTags = wrapper.findAll("td").wrappers.length;

        expect(wrapper.findAll("td").wrappers[countTdTags - 1].text()).equals("moin123");
    });

    it("should render an a and img if imageAttribute is existst in feature.properties", () => {
        expect(wrapper.find(".gfi-theme-images > div:nth-child(2) > a").exists()).to.be.true;
        expect(wrapper.find(".gfi-theme-images > div:nth-child(2) > a > img").exists()).to.be.true;
    });

    it("should the img have the source of feature properties", () => {
        expect(wrapper.find(".gfi-theme-images > div:nth-child(2) > a > img").classes()).includes("gfi-theme-images-image");
        expect(wrapper.find(".gfi-theme-images > div:nth-child(2) > a > img").attributes().src).equals("https://test.png");
    });

    it("should the img have the source of gfiTheme params as string", () => {
        const wrapper1 = shallowMount(DefaultTheme, {
            propsData: {
                feature: {
                    getProperties: function () {
                        return {
                            bildlink: "https://test.png",
                            abc: "https://abc.jpeg"
                        };
                    },
                    getTheme: function () {
                        return {
                            name: "images",
                            params: {
                                imageLink: "abc"
                            }
                        };
                    },
                    getGfiUrl: () => "",
                    getMimeType: () => "text/xml"
                }
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });

        expect(wrapper1.find(".gfi-theme-images > div:nth-child(2) > a > img").attributes().src).equals("https://abc.jpeg");
    });

    it("should the img have the source of first found element gfiTheme params as array, the order is specified by imageLink", () => {
        const wrapper2 = shallowMount(DefaultTheme, {
            propsData: {
                feature: {
                    getProperties: function () {
                        return {
                            xyz: "https://test.png",
                            abc: "https://abc.jpeg"
                        };
                    },
                    getTheme: function () {
                        return {
                            name: "images",
                            params: {
                                imageLink: ["abc", "xyz"]
                            }
                        };
                    },
                    getMimeType: () => "text/xml",
                    getGfiUrl: () => ""
                }
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });

        expect(wrapper2.find(".gfi-theme-images > div:nth-child(2) > a > img").attributes().src).equals("https://abc.jpeg");
    });

    it("should show no attribute is available message if getMappedProperties is empty", () => {
        const wrapper1 = shallowMount(DefaultTheme, {
            propsData: {
                feature: {
                    getProperties: () => {
                        return {};
                    },
                    getMappedProperties: () => {
                        return {};
                    },
                    getTheme: () => {
                        return {
                            name: "images",
                            params: {
                                imageLink: "abc"
                            }
                        };
                    },
                    getGfiUrl: () => "",
                    getMimeType: () => "text/xml"
                }
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });

        expect(wrapper1.find("td").text()).equals("modules.tools.gfi.themes.default.noAttributeAvailable");
    });

    it("should show an iframe if the mimeType is text/html", () => {
        const wrapperHtml = shallowMount(DefaultTheme, {
            propsData: {
                feature: {
                    getTheme: () => sinon.stub(),
                    getDocument: () => "lalala",
                    getMimeType: () => "text/html"
                }
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });

        expect(wrapperHtml.find("iframe").exists()).to.be.true;
        expect(wrapperHtml.find("iframe").classes()).includes("gfi-iFrame");
    });

    it("should show an iframe after click trough the features", async () => {
        await wrapper.setProps({
            feature: {
                getTheme: () => sinon.stub(),
                getDocument: () => "abc",
                getMimeType: () => "text/html"
            }
        });

        expect(wrapper.find("iframe").exists()).to.be.true;
        expect(wrapper.find("iframe").classes()).includes("gfi-iFrame");
    });
});
