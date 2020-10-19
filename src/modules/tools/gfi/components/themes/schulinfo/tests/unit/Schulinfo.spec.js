import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import SchulinfoTheme from "../../components/Schulinfo.vue";
import ThemeConfig from "../../themeConfig.json";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/components/Schulinfo.vue", () => {
    const properties = {
        "abschluss": "Allgemeine Hochschulreife|erster allgemeinbildender Schulabschluss|Erweiterter erster allgemeinbildender Schulabschluss|mittlerer Schulabschluss|schulischer Teil der Fachhochschulreife",
        "adresse_ort": "99999 Neverland",
        "adresse_strasse_hausnr": "Exampleweg",
        "anzahl_schueler": "500",
        "anzahl_schueler_gesamt": "5000 an 3 Standorten",
        "bezirk": "example Bezirk",
        "schul_telefonnr": "+49 40 123456789",
        "schul_email": "example@schulmail.com",
        "schul_homepage": "https://example.de",
        "fremdsprache": "Englisch|Französisch|Französisch|Spanisch|Spanisch|Türkisch",
        "fremdsprache_mit_klasse": "Englisch ab Klasse  5|Französisch ab Klasse  11|Französisch ab Klasse  7|Spanisch ab Klasse  11|Spanisch ab Klasse  7|Türkisch ab Klasse  5",
        "ganztagsform": "GTS teilweise gebunden",
        "is_rebbz": "true",
        "kantine_vorh": "true",
        "kapitelbezeichnung": "Stadtteilschulen",
        "schwerpunktschule": "true",
        "oberstufenprofil": "Humans and their environment (bilingual);In diesem bilingualen Profil"
    };
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(SchulinfoTheme, {
            propsData: {
                feature: {
                    getId: () => "feature1",
                    getLayerId: () => "1234",
                    getProperties: () => properties,
                    getAttributesToShow: () => sinon.stub()
                }
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });
    });

    it("should render the schulinfo theme", () => {
        expect(wrapper.find("div").exists()).to.be.true;
        expect(wrapper.classes("schulinfo")).to.be.true;
    });

    it("should render six buttons with names from topics", () => {
        const topics = ThemeConfig.themen.map(topic => topic.name);

        expect(wrapper.findAll("button").length).to.equal(7);
        wrapper.findAll("button").wrappers.forEach(button => {
            expect(topics.includes(button.text())).to.be.true;
        });
    });

    it("should assign feature properties", () => {
        const prop = {
                "adresse_strasse_hausnr": "Exampleweg",
                "kantine_vorh": "true"
            },
            attrToShow = {
                adresse_strasse_hausnr: "Adresse",
                kantine_vorh: "Kantine vorhanden"
            },
            feature = {
                getLayerId: () =>sinon.stub(),
                getProperties: () => prop,
                getAttributesToShow: () => attrToShow
            },
            result = wrapper.vm.assignFeatureProperties(feature);

        expect(result.length).to.equal(2);
        expect(result[0].name).equals("Grundsätzliche Informationen");
        expect(result[0].isSelected).to.be.true;
        expect(result[0].attributes).to.deep.equal([
            {
                attributeName: attrToShow.adresse_strasse_hausnr,
                attributeValue: [prop.adresse_strasse_hausnr]
            }]
        );
        expect(result[1].name).equals("Mittagsversorgung");
        expect(result[1].isSelected).to.be.undefined;
        expect(result[1].attributes).to.deep.equal([
            {
                attributeName: attrToShow.kantine_vorh,
                attributeValue: ["modules.tools.gfi.themes.schulinfo.yes"]
            }]
        );
    });

    it("should switch the active tab to Oberstufenprofil, if the button is clicked", async () => {
        const button = wrapper.find("button[value^= Oberstufenprofil]");

        await button.trigger("click");

        expect(wrapper.vm.selectedPropertyAttributes.length).equals(1);
        expect(wrapper.findAll("tr").length).equals(1);
        expect(wrapper.findAll("td").length).equals(2);
        expect(wrapper.findAll("td").wrappers[0].text()).equals("");
        expect(wrapper.findAll("td").wrappers[1].text()).equals("Humans and their environment (bilingual);In diesem bilingualen Profil");
    });

    it("should switch the active tab to Mittagsversorgung, if the button is clicked", async () => {
        const button = wrapper.find("button[value^= Mittagsversorgung]");

        await button.trigger("click");

        expect(wrapper.vm.selectedPropertyAttributes.length).equals(1);
        expect(wrapper.findAll("tr").length).equals(1);
        expect(wrapper.findAll("td").length).equals(2);
        expect(wrapper.findAll("td").wrappers[0].text()).equals("");
        expect(wrapper.findAll("td").wrappers[1].text()).equals("modules.tools.gfi.themes.schulinfo.yes");
    });

    it("should set the selected category to true and all other to false", () => {
        const event = {
            target: {
                value: "Mittagsversorgung"
            }
        };

        wrapper.vm.toggleSelectedCategory(event);
        wrapper.vm.assignedFeatureProperties
            .filter(property => property.name !== event.target.value)
            .forEach(prop => {
                expect(prop.isSelected).to.be.false;
            });
        expect(wrapper.vm.assignedFeatureProperties.find(property => property.name === event.target.value).isSelected).to.be.true;
    });

    it("should render the table for the first topic", () => {
        const resultValues = ["Exampleweg", "99999 Neverland", "example Bezirk", "example@schulmail.com", "+49 40 123456789", "https://example.de", "modules.tools.gfi.themes.schulinfo.yes"],
            tdText = wrapper.findAll("td").wrappers.map(td => td.text());

        expect(wrapper.vm.selectedPropertyAttributes.length).equals(7);
        expect(wrapper.findAll("tr").length).equals(7);
        expect(wrapper.findAll("td").length).equals(14);

        resultValues.forEach(value => {
            expect(tdText.includes(value)).to.be.true;
        });
    });

    it("should render all properties as phone number if the property starts with '+[xx]' (x = any Number)", () => {
        wrapper.findAll("a[href^=tel]").wrappers.forEach(a => {
            expect(a.attributes("href")).to.have.string("tel:");
        });
    });

    it("should render all properties as phone number if the property starts with '+[xx]' (x = any Number)", () => {
        expect(wrapper.find("a[href^=tel]").attributes("href")).to.have.string("tel:");
        expect(wrapper.find("a[href^=tel]").text()).equals("+49 40 123456789");
    });

    it("should render all properties as email if the property contains a @", () => {
        expect(wrapper.find("a[href^=mailto]").attributes("href")).to.have.string("@");
        expect(wrapper.find("a[href^=mailto]").text()).equals("example@schulmail.com");
    });

    it("should render all properties as link if the property starts with http", () => {
        expect(wrapper.find("a[href^=http]").text()).equals("https://example.de");
    });
});
