define(function (require) {
    var Tool = require("modules/core/modelList/tool/model"),
        StyleWMS;

    StyleWMS = Tool.extend({
        defaults: _.extend({}, Tool.prototype.defaults, {
            // true wenn dieses Tool im Fenster angezeigt wird und damit aktiv ist
            isCurrentWin: false,
            // true wenn das Fenster minimiert ist
            isCollapsed: false,
            // Bootstrap Glyphicon Class
            glyphicon: "glyphicon-tint",
            // Name (Überschrift) der Funktion
            name: "Style WMS",
            // ID des Tools
            id: "styleWMS",
            // Id vom Model dessen Layer ein neues Styling bekommt
            modelId: "",
            // Model dessen Layer ein neues Styling bekommt
            model: null,
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
            styleWMSName: "",
            // Namen und IDs der verfügbaren stylebaren Layer
            styleableLayerList: []
        }),

        initialize: function () {
            var channel = Radio.channel("StyleWMS");

            this.superInitialize();
            channel.on({
                "openStyleWMS": function (model) {

                    // Prüfe ob bereits ein Fenster offen ist, wenn nicht erzeuge ein Fenster
                    if (this.get("isActive") !== true) {
                        this.setIsActive(true);
                        Radio.trigger("Window", "toggleWin", this);
                    }

                    // Übernehme den im Themenbaum angeklickten Layer
                    this.setModel(model);
                    this.trigger("sync");
                }
            }, this);

            // Eigene Listener
            this.listenTo(this, {
                // ändert sich das Model, wird der entsprechende Geometrietyp gesetzt
                // und der Attributname zurückgesetzt
                "change:model": function (model, value) {
                    if (value !== null && value !== undefined) {
                        this.setAttributeName("default");
                        this.setGeomType(value.get("geomType"));
                    }
                },
                // ändert sich der Attributname wird die Anzahl der Klassen zurückgesetzt
                "change:attributeName": function () {
                    this.setNumberOfClasses("default");
                },
                // Sendet das SLD an die layerlist, sobald es erzeugt wurde
                "change:setSLD": function () {
                    Radio.trigger("ModelList", "setModelAttributesById", this.get("model").get("id"), {"SLDBody": this.get("setSLD"), paramStyle: "style"});
                }
            });
            this.listenTo(Radio.channel("ModelList"), {
                "updatedSelectedLayerList": function () {
                    this.refreshStyleableLayerList();
                    if (this.get("isActive") === true) {
                        // Wenn das Tool gerade aktiv ist aktualisiere den Inhalt.
                        this.trigger("sync");
                    }
                }
            });

            // this.listenTo(Radio.channel("Window"), {
            //     "winParams": this.setStatus
            // });
        },

        // // Fenstermanagement
        // setStatus: function (args) {
        //     console.log(args);
        //     if (args[2].get("id") === "styleWMS") {
        //         this.setIsCollapsed(args[1]);
        //         this.setIsCurrentWin(args[0]);
        //     }
        //     else {
        //         this.setIsCurrentWin(false);
        //     }
        // },

        // Aktualisiere die Liste stylebarer Layer
        refreshStyleableLayerList: function () {

            var styleableLayerList = [],
                layerModelList,
                result;

            // Berücksichtige selektierte stylebare Layer
            layerModelList = Radio.request("ModelList", "getModelsByAttributes", {styleable: true, isSelected: true});

            _.each(layerModelList, function (layerModel) {
                styleableLayerList.push({name: layerModel.get("name"), id: layerModel.get("id")});
            });

            this.set("styleableLayerList", styleableLayerList);

            // Wenn das aktuelle layerModel nicht mehr enthalten ist wird es deaktiviert
            if (this.get("model") !== null && this.get("model") !== undefined) {
                result = _.find(styleableLayerList, function (styleableLayer) {
                    return styleableLayer.id === this.get("model").get("id");
                }, this);

                if (result === undefined) {
                    this.setModel(null);
                    // "sync" wird später an anderer Stelle getriggert.
                }
            }
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
                        minText: "Bitte tragen Sie eine natürliche Zahl ein.",
                        minIndex: index
                    });
                }
                if (regExp.test(element.stopRange) === false) {
                    errors.push({
                        maxText: "Bitte tragen Sie eine natürliche Zahl ein.",
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

            return null;
        },

        /**
         * Prüft ob die Style-Klassen valide sind. Wenn ja, wird das SLD erstellt und gesetzt
         * @returns {void}
         */
        createSLD: function () {

            var sld = "";

            if (this.isValid() === true) {

                sld = this.createAndGetRootElement();

                this.updateLegend(this.get("styleClassAttributes"));
                this.get("model").get("layer").getSource().updateParams({SLD_BODY: sld, STYLES: "style"});
            }
        },

        removeSLDBody: function () {
            var source = this.get("model").get("layer").getSource(),
                params = source.getParams();

            /* eslint-disable-next-line no-undefined */
            params.SLD_BODY = undefined;
            params.STYLES = "";

            source.updateParams(params);
        },

        resetModel: function () {
            this.removeSLDBody();
            this.setNumberOfClasses(this.defaults.numberOfClasses);
            this.resetLegend();
        },

        // Setze das Layer-Model anhand einer gegebenen ID (aus dem Layer-Dialog).
        // Wenn dort kein Layer ausgewählt wurde, wird das Model genullt.
        setModelByID: function (id) {
            var model = null;

            if (id !== "") {
                model = Radio.request("ModelList", "getModelByAttributes", {id: id});
            }

            this.setModel(model);
            this.trigger("sync");
        },

        updateLegend: function (attributes) {
            attributes.styleWMSName = this.get("model").get("name");
            Radio.trigger("StyleWMS", "updateParamsStyleWMS", attributes);
        },

        resetLegend: function () {
            Radio.trigger("StyleWMS", "resetParamsStyleWMS", this.get("model"));
        },

        updateLayerInfo: function (layerName) {
            Radio.trigger("Layer", "updateLayerInfo", layerName);
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
         * @return {string} sld
         */
        createAndGetNamedLayer: function () {
            return "<sld:NamedLayer>" +
                       "<sld:Name>" + this.get("model").get("layers") + "</sld:Name>" +
                       this.createAndGetUserStyle() +
                   "</sld:NamedLayer>";
        },

        /**
         * Erzeugt ein UserStyle Element und liefert es zurück
         * @return {string} sld
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
         * @return {string} sld
         */
        createAndGetRule: function () {
            var rule = "";

            if (this.get("geomType") === "Polygon") {
                _.each(this.get("styleClassAttributes"), function (obj) {
                    rule += "<sld:Rule>" +
                                this.createAndGetANDFilter(obj.startRange, obj.stopRange) +
                                this.createAndGetPolygonSymbolizer(obj.color) +
                            "</sld:Rule>";
                }, this);
            }
            else {
                // TODO: ErrorHandling...
                console.error("Type of geometry is not supported, abort styling.");
            }
            return rule;
        },

        /**
         * Erzeugt ein AND-Filter Element und liefert es zurück
         * @param  {string} startRange - Anfang des Wertebereichs
         * @param  {string} stopRange - Ende des Wertebereichs
         * @return {string} sld
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
         * @return {string} sld
         */
        createAndGetIsGreaterThanOrEqualTo: function (value) {
            return "<ogc:PropertyIsGreaterThanOrEqualTo>" +
                       "<ogc:PropertyName>" +
                       this.get("attributeName") +
                       "</ogc:PropertyName>" +
                       "<ogc:Literal>" +
                           value +
                       "</ogc:Literal>" +
                   "</ogc:PropertyIsGreaterThanOrEqualTo>";
        },

        /**
         * Erzeugt ein PropertyIsLessThanOrEqualTo Element und liefert es zurück
         * @param  {string} value - Ende des Wertebereichs
         * @return {string} sld
         */
        createAndGetIsLessThanOrEqualTo: function (value) {
            return "<ogc:PropertyIsLessThanOrEqualTo>" +
                       "<ogc:PropertyName>" +
                       this.get("attributeName") +
                       "</ogc:PropertyName>" +
                       "<ogc:Literal>" +
                           value +
                       "</ogc:Literal>" +
                   "</ogc:PropertyIsLessThanOrEqualTo>";
        },

        /**
         * Erzeugt ein PolygonSymbolizer Element und liefert es zurück
         * @param  {string} value - Style Farbe
         * @return {string} sld
         */
        createAndGetPolygonSymbolizer: function (value) {
            return "<sld:PolygonSymbolizer>" +
                       this.createAndGetFillParams(value) +
                   "</sld:PolygonSymbolizer>";
        },

        /**
         * Erzeugt ein Fill Element und liefert es zurück
         * @param  {string} value - Style Farbe
         * @return {string} sld
         */
        createAndGetFillParams: function (value) {
            return "<sld:Fill>" +
                       "<sld:CssParameter name='fill'>" +
                           value +
                       "</sld:CssParameter>" +
                   "</sld:Fill>";
        },

        setModel: function (value) {
            this.set("model", value);
        },

        setGeomType: function (value) {
            this.set("geomType", value);
        },

        setAttributeName: function (value) {
            this.set("attributeName", value);
        },

        setNumberOfClasses: function (value) {
            this.set("numberOfClasses", value);
        },

        setStyleClassAttributes: function (value) {
            this.set("styleClassAttributes", value);
        },

        setErrors: function (value) {
            this.set("errors", value);
        }

        // setIsCurrentWin: function (value) {
        //     this.set("isCurrentWin", value);
        // },

        // setIsCollapsed: function (value) {
        //     this.set("isCollapsed", value);
        // }
    });

    return StyleWMS;
});
