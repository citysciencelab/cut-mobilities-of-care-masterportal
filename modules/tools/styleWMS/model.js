define([
    "backbone",
    "backbone.radio"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        StyleWMS;

    StyleWMS = Backbone.Model.extend({
        defaults: {
            // true wenn dieses Tool im Fenster angezeigt wird und damit aktiv ist
            isCurrentWin: false,
            // true wenn das Fenster minimiert ist
            isCollapsed: false,
            // Id vom Model dessen Layer ein neues Styling bekommt
            modelId: "",
            // Model dessen Layer ein neues Styling bekommt
            model: {},
            // Art der Layer Geometrie
            geomType: "",
            // Name des Attributs, auf das der Style angewendet wird
            attributeName: "default",
            // Anzahl der verfügbaren Style-Klassen
            numberOfClassesList: ["1", "2", "3", "4", "5"],
            // Anzahl der verwendeten Style-Klassen
            numberOfClasses: "default",
            // Die Angaben der Style Klassen (Wertebereich und Farbe)
            styleClassAttributes: [],
            styleWMSName: ""
        },

        /**
         * Wird aufgerufen wenn das Model erzeugt wird
         * Registriert Listener auf sich selbst und den Radio
         */
        initialize: function () {
            var channel = Radio.channel("StyleWMS");

            channel.on({
                "openStyleWMS": function (model) {
                    this.setModel(model);
                    this.trigger("sync");
                }
            }, this);

            // Eigene Listener
            this.listenTo(this, {
                // ändert sich das Model, wird der entsprechende Geometrietyp gesetzt
                // und der Attributname zurückgesetzt
                "change:model": function (model, value) {
                    this.setAttributeName("default");
                    this.setGeomType(value.get("geomType"));
                },
                // ändert sich der Attributname wird die Anzahl der Klassen zurückgesetzt
                "change:attributeName": function () {
                    this.setNumberOfClasses("default");
                },
                // Sendet das SLD an die layerlist, sobald es erzeugt wurde
                "change:setSLD": function () {
                    Radio.trigger("ModelList", "setModelAttributesById", this.getModel().getId(), {"SLDBody": this.getSLDBody(), paramStyle: "style"});
                }
            });
        },

        /**
         * Wenn die validierten Attribute valide sind, wird nichts zurückgegeben
         * Anderenfalls die Fehlermeldungen
         * Triggert ein "invalid" an sich selbst, wenn die Validation fehlschlägt
         * @param  {Object} attributes - Backbone.Model.attributes
         * @return {Object[]} errors - Die Fehlermeldungen
         * @see {@link http://backbonejs.org/#Model-validate|Backbone}
         */
        validate: function (attributes) {
            var prevMax = -1,
                errors = [],
                regExp = new RegExp("^[0-9]+$");

            _.each(attributes.styleClassAttributes, function (element, index) {
                var min = parseInt(element.startRange, 10),
                    max = parseInt(element.stopRange, 10);

                if (regExp.test(element.startRange) === false) {
                    errors.push({
                        minText: "Bitte tragen sie eine natürliche Zahl ein.",
                        minIndex: index
                    });
                }
                if (regExp.test(element.stopRange) === false) {
                    errors.push({
                        maxText: "Bitte tragen sie eine natürliche Zahl ein.",
                        maxIndex: index
                    });
                }
                if (element.color === "") {
                    errors.push({
                        colorText: "Bitte wählen Sie eine Farbe aus.",
                        colorIndex: index
                    });
                }
                if (min >= max) {
                    errors.push({
                        rangeText: "Überprüfen Sie die Werte.",
                        rangeIndex: index
                    });
                }
                if (prevMax >= min) {
                    errors.push({
                        intersectText: "Überprüfen Sie die Werte. Wertebereiche dürfen sich nicht überschneiden.",
                        intersectIndex: index,
                        prevIndex: index - 1
                    });
                }
                prevMax = max;
            }, this);

            this.setErrors(errors);
            if (_.isEmpty(errors) === false) {
                return errors;
            }
        },

        /**
         * Prüft ob die Style-Klassen valide sind. Wenn ja, wird das SLD erstellt und gesetzt
         */
        createSLD: function () {
            if (this.isValid() === true) {
                this.setSLD(this.createAndGetRootElement());
                this.updateLegend(this.getStyleClassAtributes());
            }
        },

        updateLegend: function (attributes) {
            attributes.styleWMSName = this.get("model").get("name");
            Radio.trigger("StyleWMS", "updateParamsStyleWMS", attributes);
        },

        /**
         * Erzeugt das Root Element der SLD (StyledLayerDescriptor) für die Version 1.0.0
         * und liefert das gesamte SLD zurück
         * @return {string} - das SLD
         * @see {@link http://suite.opengeo.org/ee/docs/4.5/geoserver/styling/sld-reference/index.html|SLD Reference}
         */
        createAndGetRootElement: function () {
            return "<sld:StyledLayerDescriptor version='1.0.0' xmlns:sld='http://www.opengis.net/sld' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>" +
                        this.createAndGetNamedLayer() +
                   "</sld:StyledLayerDescriptor>";
        },

        /**
         * Erzeugt ein NamedLayer Element und liefert es zurück
         * @return {string}
         */
        createAndGetNamedLayer: function () {
            return "<sld:NamedLayer>" +
                       "<sld:Name>" + this.getModel().get("layers") + "</sld:Name>" +
                       this.createAndGetUserStyle() +
                   "</sld:NamedLayer>";
        },

        /**
         * Erzeugt ein UserStyle Element und liefert es zurück
         * @return {string}
         */
        createAndGetUserStyle: function () {
            return "<sld:UserStyle>" +
                       "<sld:Name>style</sld:Name>" +
                       "<sld:FeatureTypeStyle>" +
                           this.createAndGetRule() +
                       "</sld:FeatureTypeStyle>" +
                   "</sld:UserStyle>";
        },

        /**
         * Erzeugt 1-n Rule Elemente und liefert sie zurück
         * Abhängig von der Anzahl der Style Klassen
         * @return {string}
         */
        createAndGetRule: function () {
            var rule = "";

            if (this.getGeomType() === "Polygon") {
                _.each(this.getStyleClassAtributes(), function (obj) {
                    rule += "<sld:Rule>" +
                                this.createAndGetANDFilter(obj.startRange, obj.stopRange) +
                                this.createAndGetPolygonSymbolizer(obj.color) +
                            "</sld:Rule>";
                }, this);
            }
            return rule;
        },

        /**
         * Erzeugt ein AND-Filter Element und liefert es zurück
         * @param  {string} startRange - Anfang des Wertebereichs
         * @param  {string} stopRange - Ende des Wertebereichs
         * @return {string}
         */
        createAndGetANDFilter: function (startRange, stopRange) {
            return "<ogc:Filter>" +
                       "<ogc:And>" +
                           this.createAndGetIsGreaterThanOrEqualTo(startRange) +
                           this.createAndGetIsLessThanOrEqualTo(stopRange) +
                       "</ogc:And>" +
                   "</ogc:Filter>";
        },

        /**
         * Erzeugt ein PropertyIsGreaterThanOrEqualTo Element und liefert es zurück
         * @param  {string} value - Anfang des Wertebereichs
         * @return {string}
         */
        createAndGetIsGreaterThanOrEqualTo: function (value) {
            return "<ogc:PropertyIsGreaterThanOrEqualTo>" +
                       "<ogc:PropertyName>" +
                           this.getAttributeName() +
                       "</ogc:PropertyName>" +
                       "<ogc:Literal>" +
                           value +
                       "</ogc:Literal>" +
                   "</ogc:PropertyIsGreaterThanOrEqualTo>";
        },

        /**
         * Erzeugt ein PropertyIsLessThanOrEqualTo Element und liefert es zurück
         * @param  {string} value - Ende des Wertebereichs
         * @return {string}
         */
        createAndGetIsLessThanOrEqualTo: function (value) {
            return "<ogc:PropertyIsLessThanOrEqualTo>" +
                       "<ogc:PropertyName>" +
                           this.getAttributeName() +
                       "</ogc:PropertyName>" +
                       "<ogc:Literal>" +
                           value +
                       "</ogc:Literal>" +
                   "</ogc:PropertyIsLessThanOrEqualTo>";
        },

        /**
         * Erzeugt ein PolygonSymbolizer Element und liefert es zurück
         * @param  {string} value - Style Farbe
         * @return {string}
         */
        createAndGetPolygonSymbolizer: function (value) {
            return "<sld:PolygonSymbolizer>" +
                       this.createAndGetFillParams(value) +
                   "</sld:PolygonSymbolizer>";
        },

        /**
         * Erzeugt ein Fill Element und liefert es zurück
         * @param  {string} value - Style Farbe
         * @return {string}
         */
        createAndGetFillParams: function (value) {
            return "<sld:Fill>" +
                       "<sld:CssParameter name='fill'>" +
                           value +
                       "</sld:CssParameter>" +
                   "</sld:Fill>";
        },

        /**
         * Setter für das Attribut model
         * @param {Backbone.Model} value
         */
        setModel: function (value) {
            this.set("model", value);
        },

        /**
         * Setter für das Attribut geomType
         * @param {string} value
         */
        setGeomType: function (value) {
            this.set("geomType", value);
        },

        /**
         * Setter für das Attribut attributeName
         * @param {string} value
         */
        setAttributeName: function (value) {
            this.set("attributeName", value);
        },

        /**
         * Setter für das Attribut numberOfClasses
         * @param {string} value
         */
        setNumberOfClasses: function (value) {
            this.set("numberOfClasses", value);
        },

        /**
         * Setter für das Attribut styleClassAttributes
         * @param {Object[]} value
         */
        setStyleClassAttributes: function (value) {
            this.set("styleClassAttributes", value);
        },

        /**
         * Setter für das Attribut setSLD
         * @param {string} value
         */
        setSLD: function (value) {
            this.set("setSLD", value);
        },

        /**
         * Setter für das Attribut errors
         * @param {Object[]} value
         */
        setErrors: function (value) {
            this.set("errors", value);
        },

        /**
         * Setter für das Attribut isCurrentWin
         * @param {boolean} value
         */
        setIsCurrentWin: function (value) {
            this.set("isCurrentWin", value);
        },

        /**
         * Setter für das Attribut isCollapsed
         * @param {boolean} value
         */
        setIsCollapsed: function (value) {
            this.set("isCollapsed", value);
        },

        /**
         * Getter für das Attribut model
         * @return {Backbone.Model}
         */
        getModel: function () {
            return this.get("model");
        },

        /**
         * Getter für das Attribut geomType
         * @return {string}
         */
        getGeomType: function () {
            return this.get("geomType");
        },

        /**
         * Getter für das Attribut attributeName
         * @return {string}
         */
        getAttributeName: function () {
            return this.get("attributeName");
        },

        /**
         * Getter für das Attribut styleClassAttributes
         * @return {string}
         */
        getStyleClassAtributes: function () {
            return this.get("styleClassAttributes");
        },

        /**
         * Getter für das Attribut setSLD
         * @return {string}
         */
        getSLDBody: function () {
            return this.get("setSLD");
        },

        /**
         * Getter für das Attribut errors
         * @return {string}
         */
        getErrors: function () {
            return this.get("errors");
        },

        /**
         * Getter für das Attribut isCurrentWin
         * @return {string}
         */
        getIsCurrentWin: function () {
            return this.get("isCurrentWin");
        },

        /**
         * Getter für das Attribut isCollapsed
         * @return {string}
         */
        getIsCollapsed: function () {
            return this.get("isCollapsed");
        }
    });

    return StyleWMS;
});
