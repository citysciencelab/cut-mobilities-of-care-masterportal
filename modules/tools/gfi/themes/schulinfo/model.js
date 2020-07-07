import Theme from "../model";

const SchulInfoTheme = Theme.extend({
    defaults: Object.assign({}, Theme.prototype.defaults, {
        themeConfig: [{
            name: "Grundsätzliche Informationen",
            isSelected: true,
            attributes: [
                "schulname",
                "schulform",
                "schultyp",
                // "Zusatzinformation zur Schulform", ?? SD
                "schwerpunktschule",
                "adresse_strasse_hausnr",
                "adresse_ort",
                "stadtteil",
                "bezirk",
                "schul_telefonnr",
                "schul_email",
                "schulportrait",
                "schul_homepage",
                "name_schulleiter",
                "zustaendiges_rebbz",
                "rebbz_homepage",
                "schulaufsicht",
                "offenetuer"]
        },
        {
            name: "Schulgröße",
            attributes: [
                "anzahl_schueler_gesamt",
                "zuegigkeit_kl_1",
                "standortkl1",
                "zuegigkeit_kl_5",
                "standortkl5"
            ]
        },
        {
            name: "Abschlüsse",
            attributes: ["abschluss"]
        },
        {
            name: "weitere Informationen",
            attributes: [
                "foerderart",
                "auszeichnung",
                "schuelerzeitung",
                "schulische_ausrichtung",
                "schulpartnerschaft",
                "schulinspektion_link",
                "schulportrait",
                "einzugsgebiet",
                "schulwahl_wohnort"
            ]
        },
        {
            name: "Sprachen",
            attributes: [
                "fremdsprache_mit_klasse",
                "bilingual",
                "sprachzertifikat"
            ]
        },
        {
            name: "Ganztag",
            attributes: [
                "ganztagsform",
                "kernzeitbetreuung",
                "ferienbetreuung_anteil",
                "kernunterricht"
            ]
        },
        {
            name: "Mittagsversorgung",
            attributes: [
                "mittagspause",
                "kantine_vorh",
                "wahlmoeglichkeit_essen",
                "vegetarisch",
                "nutzung_kantine_anteil",
                "kiosk_vorh"
            ]
        },
        {
            name: "Ansprechpartner",
            attributes: [
                "name_schulleiter",
                "name_stellv_schulleiter",
                "ansprechp_buero",
                "ansprechp_klasse_1",
                "ansprechp_klasse_5",
                "name_oberstufenkoordinator"
            ]
        },
        {
            name: "Oberstufenprofil",
            attributes: [
                "oberstufenprofil",
                "standortoberstufe"
            ]
        }]
    }),
    initialize: function () {

        this.listenTo(this, {
            "change:isReady": this.parseGfiContent
        });

        this.get("feature").on("propertychange", this.toggleStarGlyphicon.bind(this));

        this.get("feature").set("layerId", this.get("id"));
        this.get("feature").set("layerName", this.get("name"));
    },
    getVectorGfi: function () {
        const gfiContentPick = this.get("themeConfig").map(value => value.attributes);
        let gfiContent = Object.fromEntries(Object.entries(this.get("feature").getProperties()).filter(([key]) => (Array.isArray(gfiContentPick) ? gfiContentPick.reduce((acc, val) => acc.concat(val), []) : gfiContentPick).includes(key)));


        gfiContent = this.getManipulateDate([gfiContent]);
        this.setGfiContent(gfiContent);
        this.setIsReady(true);
    },

    /**
     * Ermittelt alle Namen(=Zeilennamen) der Eigenschaften der Objekte
     * @returns {void}
     */
    parseGfiContent: function () {
        let gfiContent,
            featureInfos = [];

        if (this.get("gfiContent")[0] !== undefined) {
            gfiContent = this.get("gfiContent")[0];
            featureInfos = [];
            featureInfos = this.createFeatureInfos(gfiContent, this.get("themeConfig"));
            this.setFeatureInfos(featureInfos);
            this.determineSelectedContent(featureInfos);
        }
    },
    /**
     * categorizes gfiContent according to categories in themeConfig
     * @param  {Object[]} gfiContent  [description]
     * @param  {Object[]} themeConfig [description]
     * @return {Object[]}             [description]
     */
    createFeatureInfos: function (gfiContent, themeConfig) {
        const featureInfos = [];

        if (themeConfig !== undefined) {
            themeConfig.forEach(kategory => {
                const kategoryObj = {
                    name: kategory.name,
                    isSelected: kategory.isSelected ? kategory.isSelected : false,
                    attributes: []};

                kategory.attributes.forEach(attribute => {
                    const isAttributeFound = this.checkForAttribute(gfiContent, attribute);

                    if (isAttributeFound) {
                        kategoryObj.attributes.push({
                            attrName: this.get("gfiAttributes")[attribute] === undefined ? attribute : this.get("gfiAttributes")[attribute],
                            attrValue: this.beautifyAttribute(gfiContent[attribute], attribute)
                        });
                    }
                });
                featureInfos.push(kategoryObj);
            });
        }
        return featureInfos;
    },
    beautifyAttribute: function (attribute, key) {
        let newVal,
            beautifiedAttribute = attribute;

        if (key === "oberstufenprofil" && typeof attribute === "string") {
            if (beautifiedAttribute.indexOf("|") !== -1) {
                beautifiedAttribute = [];
                attribute.split("|").forEach(value => {
                    newVal = value;
                    // make part before first ";" bold
                    newVal = newVal.replace(/^/, "<b>");
                    newVal = newVal.replace(/;/, "</b>;");
                    beautifiedAttribute.push(newVal);
                });
            }
            else {
                newVal = attribute;
                // make part before first ";" bold
                newVal = newVal.replace(/^/, "<b>");
                newVal = newVal.replace(/;/, "</b>;");

                beautifiedAttribute = newVal;
            }
            return beautifiedAttribute;
        }
        if (attribute.indexOf("|") !== -1) {
            return attribute.split("|");
        }
        if (attribute === "true" || attribute === "ja") {
            return "Ja";
        }
        if (attribute === "false" || attribute === "nein") {
            return "Nein";
        }
        return attribute;
    },
    /**
     * determines Selected Content to show in .gfi-content
     * @param  {Object[]} featureInfos [description]
     * @return {void}
     */
    determineSelectedContent: function (featureInfos) {
        const selectedContent = featureInfos.filter(function (featureInfo) {
            return featureInfo.isSelected;
        })[0];

        this.setSelectedContent(selectedContent);
    },
    /**
     * checks if attribute is in gfiContent
     * @param  {Object[]} gfiContent [description]
     * @param  {String} attribute name
     * @return {Boolean} Flag if Attribute is found
     */
    checkForAttribute: function (gfiContent, attribute) {
        let isAttributeFound = false;

        if (gfiContent[attribute] !== undefined) {
            isAttributeFound = true;
        }

        return isAttributeFound;
    },
    /**
     * updates featureInfos.
     * @param  {String} newName new name of Feature Info
     * @return {void}
     */
    updateFeatureInfos: function (newName) {
        let featureInfos = this.get("featureInfos");

        featureInfos = this.setIsSelected(newName, featureInfos);
        this.setFeatureInfos(featureInfos);
        this.determineSelectedContent(featureInfos);
    },
    /**
     * setsFeature selected where feature.name === newName
     * @param {String} newName - new name of Feature info
     * @param {Object[]} featureInfos -
     * @returns {Object[]} featureInfos
     */
    setIsSelected: function (newName, featureInfos) {
        let newNameFound = false;

        newNameFound = this.isNewNameInFeatureInfos(newName, featureInfos);
        if (newNameFound) {
            featureInfos.forEach(featureInfo => {
                if (featureInfo.name === newName) {
                    featureInfo.isSelected = true;
                }
                else {
                    featureInfo.isSelected = false;
                }
            });
        }
        return featureInfos;
    },
    /**
     * checks is newName is in featureInfos
     * @param  {String}  newName to be checked in featureInfos
     * @param  {Object[]}  featureInfos array of objects
     * @return {Boolean}  Flag if new name is found
     */
    isNewNameInFeatureInfos: function (newName, featureInfos) {
        let newNameFound = false;

        const filterArray = featureInfos.filter(function (featureObject) {
            if (featureObject.name === newName) {
                return true;
            }
            return false;
        });

        if (filterArray.length > 0) {
            newNameFound = true;
        }
        return newNameFound;
    },

    toggleStarGlyphicon: function (evt) {
        if (evt.key === "isOnCompareList") {
            this.trigger("toggleStarGlyphicon", evt.target);
        }
    },

    // setter for selectedContent
    setSelectedContent: function (value) {
        this.set("selectedContent", value);
    },
    // setter for featureInfos
    setFeatureInfos: function (value) {
        this.set("featureInfos", value);
    }
});

export default SchulInfoTheme;
