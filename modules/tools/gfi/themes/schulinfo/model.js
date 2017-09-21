define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        SchulInfoTheme;

    SchulInfoTheme = Theme.extend({
        defaults: _.extend({}, Theme.prototype.defaults, {
            themeConfig: {
                kategories: [{
                    name: "Grundsätzliche Informationen",
                    isSelected: true,
                    attributes: [
                        "Name",
                        "Schulform",
                        "Schulstandort",
                        "Zusatzinformation zur Schulform",
                        "Schwerpunktschule Inklusion",
                        "Strasse",
                        "Ort",
                        "Stadtteil",
                        "Bezirk",
                        "Telefon",
                        "Email",
                        "Schulportrait",
                        "Homepage",
                        "Schulleitung",
                        "Zuständiges ReBBZ",
                        "Homepage des ReBBZ",
                        "Schulaufsicht",
                        "Tag d. offenen Tür"]
                },
                {
                    name: "Schulgröße",
                    attributes: [
                        "Schülerzahl",
                        "Parallelklassen (Kl. 1)",
                        "Parallelklassen (Kl. 5)"
                    ]
                },
                {
                    name: "Abschlüsse",
                    attributes: [
                        "Abschluss",
                        "Schulentlassene ohne Abschluss (%)",
                        "Schulentlassene mit ESA (%)",
                        "Schulentlassene mit MSA (%)",
                        "Schulentlassene mit FHR oder Abitur (%)"]
                },
                {
                    name: "weitere Informationen",
                    attributes: [
                        "Auszeichnung",
                        "Schülerzeitung",
                        "Schwerpunkte in den Angeboten",
                        "Schulpartnerschaft",
                        "Schulinspektion",
                        "Schulportrait",
                        "Einzugsgebiet",
                        "Schulwahl Wohnort"
                        ]
                },
                {
                    name: "Sprachen",
                    attributes: [
                        "Fremdsprachen",
                        "Fremdsprachen ab Klassenstufe",
                        "Bilingual",
                        "Sprachzertifikat"]
                },
                {
                    name: "Ganztag",
                    attributes: [
                        "Ganztagsform",
                        "Kernzeitbetreuung",
                        "Anteil Ferienbetreuung",
                        "Kernunterricht"]
                },
                {
                    name: "Mittagsversorgung",
                    attributes: [
                        "Mittagspause",
                        "Kantine",
                        "Wahlmöglichkeit Essen",
                        "Vegetarisch",
                        "Nutzung Kantine",
                        "Kiosk"]
                }]
            }
        }),
        initialize: function () {
            this.listenTo(this, {
                "change:isReady": this.parseGfiContent
            });
        },
        /**
         * Ermittelt alle Namen(=Zeilennamen) der Eigenschaften der Objekte
         */
        parseGfiContent: function () {
            if (!_.isUndefined(this.getGfiContent()[0])) {

                var gfiContent = this.getGfiContent()[0],
                    themeConfig = this.get("themeConfig"),
                    featureInfos = [];

                featureInfos = this.createFeatureInfos(gfiContent, themeConfig);
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

            _.each(themeConfig.kategories, function (kategory) {
                    var kategoryObj = {
                        name: kategory.name,
                        isSelected: kategory.isSelected ? kategory.isSelected : false,
                        attributes: []};

                    _.each(kategory.attributes, function (attribute) {
                        var isAttributeFound = this.checkForAttribute(gfiContent, attribute);

                        if (isAttributeFound) {
                            kategoryObj.attributes.push({
                                attrName: attribute,
                                attrValue: this.beautifyAttribute(gfiContent[attribute])
                            });
                        }
                    }, this);
                    featureInfos.push(kategoryObj);
                }, this);
            }
            return featureInfos;
        },
        beautifyAttribute: function (attribute) {
            if (attribute.indexOf("|") !== -1) {
                attribute = attribute.split("|").join("<br>");
            }
            if (attribute === "true" || attribute === "ja") {
                attribute = "Ja";
            }
            if (attribute === "false" || attribute === "nein") {
                attribute = "Nein";
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
         * @param {[type]} newName      [description]
         * @param {[type]} featureInfos [description]
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
                else {
                    return false;
                }
            });
            if (filterArray.length > 0) {
                newNameFound = true;
            }
            return newNameFound;
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

    return SchulInfoTheme;
});
