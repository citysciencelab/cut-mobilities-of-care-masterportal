import Theme from "../model";

const SchulInfoTheme = Theme.extend({
    defaults: _.extend({}, Theme.prototype.defaults, {
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
        var gfiContent = _.pick(this.get("feature").getProperties(), _.flatten(_.pluck(this.get("themeConfig"), "attributes")));

        gfiContent = this.getManipulateDate([gfiContent]);
        this.setGfiContent(gfiContent);
        this.setIsReady(true);
    },

    /**
     * Ermittelt alle Namen(=Zeilennamen) der Eigenschaften der Objekte
     * @returns {void}
     */
    parseGfiContent: function () {
        var gfiContent,
            featureInfos = [];

        if (!_.isUndefined(this.get("gfiContent")[0])) {
            gfiContent = this.get("gfiContent")[0];
            featureInfos = [];
            featureInfos = this.createFeatureInfos(gfiContent, this.get("themeConfig"));
            this.setFeatureInfos(featureInfos);
            this.determineSelectedContent(featureInfos);
        }
    },
    /**
     * categorizes gfiContent according to categories in themeConfig
     * @param  {[type]} gfiContent  [description]
     * @param  {[type]} themeConfig [description]
     * @return {[type]}             [description]
     */
    createFeatureInfos: function (gfiContent, themeConfig) {
        var featureInfos = [];

        if (!_.isUndefined(themeConfig)) {

            _.each(themeConfig, function (kategory) {
                var kategoryObj = {
                    name: kategory.name,
                    isSelected: kategory.isSelected ? kategory.isSelected : false,
                    attributes: []};

                _.each(kategory.attributes, function (attribute) {
                    var isAttributeFound = this.checkForAttribute(gfiContent, attribute);

                    if (isAttributeFound) {
                        kategoryObj.attributes.push({
                            attrName: _.isUndefined(this.get("gfiAttributes")[attribute]) ? attribute : this.get("gfiAttributes")[attribute],
                            attrValue: this.beautifyAttribute(gfiContent[attribute], attribute)
                        });
                    }
                }, this);
                featureInfos.push(kategoryObj);
            }, this);
        }
        return featureInfos;
    },
    beautifyAttribute: function (attribute, key) {
        var newVal,
            beautifiedAttribute = attribute;

        if (key === "oberstufenprofil") {
            if (beautifiedAttribute.indexOf("|") !== -1) {
                beautifiedAttribute = [];
                _.each(attribute.split("|"), function (value) {
                    newVal = value;
                    // make part before first ";" bold
                    newVal = newVal.replace(/^/, "<b>");
                    newVal = newVal.replace(/;/, "</b>;");
                    beautifiedAttribute.push(newVal);
                }, this);
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
     * @param  {[type]} featureInfos [description]
     * @return {[type]}              [description]
     */
    determineSelectedContent: function (featureInfos) {
        var selectedContent = _.filter(featureInfos, function (featureInfo) {
            return featureInfo.isSelected;
        })[0];

        this.setSelectedContent(selectedContent);
    },
    /**
     * checks if attribute is in gfiContent
     * @param  {[type]} gfiContent [description]
     * @param  {[type]} attribute  [description]
     * @return {[type]}            [description]
     */
    checkForAttribute: function (gfiContent, attribute) {
        var isAttributeFound = false;

        if (!_.isUndefined(gfiContent[attribute])) {
            isAttributeFound = true;
        }

        return isAttributeFound;
    },
    /**
     * updates featureInfos.
     * @param  {[type]} newName [description]
     * @return {[type]}                 [description]
     */
    updateFeatureInfos: function (newName) {
        var featureInfos = this.get("featureInfos");

        featureInfos = this.setIsSelected(newName, featureInfos);
        this.setFeatureInfos(featureInfos);
        this.determineSelectedContent(featureInfos);
    },
    /**
     * setsFeature selected where feature.name === newName
     * @param {[type]} newName -
     * @param {[type]} featureInfos -
     * @returns {object} featureInfos
     */
    setIsSelected: function (newName, featureInfos) {
        var newNameFound = false;

        newNameFound = this.isNewNameInFeatureInfos(newName, featureInfos);
        if (newNameFound) {
            _.each(featureInfos, function (featureInfo) {
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
     * @param  {[type]}  newName      [description]
     * @param  {[type]}  featureInfos [description]
     * @return {Boolean}              [description]
     */
    isNewNameInFeatureInfos: function (newName, featureInfos) {
        var newNameFound = false,
            filterArray;

        filterArray = _.filter(featureInfos, function (featureObject) {
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
