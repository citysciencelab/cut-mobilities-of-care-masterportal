import Tool from "../../core/modelList/tool/model";

const StyleWMS = Tool.extend({
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
        styleableLayerList: [],
        wmsSoftware: "DEEGREE"
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
                    this.setAttributeName(this.defaults.attributeName);
                    this.setGeomType(value.get("geomType"));
                }
            },
            // ändert sich der Attributname wird die Anzahl der Klassen zurückgesetzt
            "change:attributeName": function () {
                this.setNumberOfClasses(this.defaults.numberOfClasses);
                this.resetStyleClassAttributes();
            },
            "change:numberOfClasses": function () {
                this.resetStyleClassAttributes();
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
    },

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
            if (this.get("wmsSoftware") === "ESRI") {
                sld = this.createEsriRootElement();
            }
            else if (this.get("wmsSoftware") === "DEEGREE") {
                sld = this.createDeegreeRootElement();
            }
            else {
                console.error("Konnte mit wmsSoftware=" + this.get("wmsSoftware") + "nicht arbeiten!")
            }
            console.log(sld);

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
        this.resetStyleClassAttributes();
        this.resetLegend();
    },
    resetStyleClassAttributes: function () {
        this.setStyleClassAttributes(this.defaults.styleClassAttributes);
    },

    // Setze das Layer-Model anhand einer gegebenen ID (aus dem Layer-Dialog).
    // Wenn dort kein Layer ausgewählt wurde, wird das Model genullt.
    setModelByID: function (id) {
        var model = null;

        if (id !== "") {
            model = Radio.request("ModelList", "getModelByAttributes", {id: id});
        }
        this.requestWmsSoftware(model);
        this.setModel(model);
        this.trigger("sync");
    },

    requestWmsSoftware: function (model) {
        if (model) {
            $.ajax({
                url: Radio.request("Util", "getProxyURL", model.get("url")) + "?SERVICE=" + model.get("typ") + "&VERSION=" + model.get("version") + "&REQUEST=GetCapabilities",
                context: this,
                success: this.checkWmsSoftwareResponse,
                async: false
            });
        }
    },

    checkWmsSoftwareResponse: function (data) {
        const capabilities = data.getElementsByTagName("WMS_Capabilities")[0],
            isEsri = capabilities.getAttribute("xmlns:esri_wms") !== null;

        if (isEsri) {
            this.setWmsSoftware("ESRI");
        }
        else {
            this.setWmsSoftware("DEEGREE");
        }
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
     * ESRI: Erzeugt das Root Element der SLD (StyledLayerDescriptor) für die Version 1.0.0
     * und liefert das gesamte SLD zurück
     * @return {string} - das SLD
     * @see {@link http://suite.opengeo.org/ee/docs/4.5/geoserver/styling/sld-reference/index.html|SLD Reference}
     */
    createEsriRootElement: function () {
        return "<sld:StyledLayerDescriptor version='1.0.0' xmlns:sld='http://www.opengis.net/sld' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>" +
                    this.createEsriNamedLayer() +
               "</sld:StyledLayerDescriptor>";
    },

    /**
     * DEEGREE: Erzeugt das Root Element der SLD (StyledLayerDescriptor) für die Version 1.0.0
     * und liefert das gesamte SLD zurück
     * @return {string} - das SLD
     * @see {@link http://suite.opengeo.org/ee/docs/4.5/geoserver/styling/sld-reference/index.html|SLD Reference}
     */
    createDeegreeRootElement: function () {
        return "<StyledLayerDescriptor xmlns='http://www.opengis.net/se' xmlns:app='http://www.deegree.org/app' xmlns:deegreeogc='http://www.deegree.org/ogc' xmlns:ogc='http://www.opengis.net/ogc' xmlns:sed='http://www.deegree.org/se' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/se http://schemas.opengis.net/se/1.1.0/FeatureStyle.xsd http://www.deegree.org/se http://schemas.deegree.org/se/1.1.0/Symbolizer-deegree.xsd'>" +
                    this.createDeegreeNamedLayer() +
               "</sld:StyledLayerDescriptor>";
    },

    /**
     * ESRI: Erzeugt ein NamedLayer Element und liefert es zurück
     * @return {string} sld
     */
    createEsriNamedLayer: function () {
        return "<sld:NamedLayer>" +
                   "<sld:Name>" + this.get("model").get("layers") + "</sld:Name>" +
                   this.createEsriUserStyle() +
               "</sld:NamedLayer>";
    },

    /**
     * DEEGREE: Erzeugt ein NamedLayer Element und liefert es zurück
     * @return {string} sld
     */
    createDeegreeNamedLayer: function () {
        return "<sld:NamedLayer>" +
                   "<sld:Name>" + this.get("model").get("layers") + "</sld:Name>" +
                   this.createEsriUserStyle() +
               "</sld:NamedLayer>";
    },

    /**
     * Erzeugt ein UserStyle Element und liefert es zurück
     * @return {string} sld
     */
    createEsriUserStyle: function () {
        return "<sld:UserStyle>" +
                   "<sld:Name>style</sld:Name>" +
                   "<sld:FeatureTypeStyle>" +
                       this.createEsriRules() +
                   "</sld:FeatureTypeStyle>" +
               "</sld:UserStyle>";
    },

    /**
     * Erzeugt 1-n Rule Elemente und liefert sie zurück
     * Abhängig von der Anzahl der Style Klassen
     * @return {string} sld
     */
    createEsriRules: function () {
        var rule = "";

        if (this.get("geomType") === "Polygon") {
            _.each(this.get("styleClassAttributes"), function (obj) {
                rule += "<sld:Rule>" +
                            this.createEsriANDFilter(obj.startRange, obj.stopRange) +
                            this.createEsriPolygonSymbolizer(obj.color) +
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
    createEsriANDFilter: function (startRange, stopRange) {
        return "<ogc:Filter>" +
                   "<ogc:And>" +
                       this.createEsriIsGreaterThanOrEqualTo(startRange) +
                       this.createEsriIsLessThanOrEqualTo(stopRange) +
                   "</ogc:And>" +
               "</ogc:Filter>";
    },

    /**
     * Erzeugt ein PropertyIsGreaterThanOrEqualTo Element und liefert es zurück
     * @param  {string} value - Anfang des Wertebereichs
     * @return {string} sld
     */
    createEsriIsGreaterThanOrEqualTo: function (value) {
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
    createEsriIsLessThanOrEqualTo: function (value) {
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
    createEsriPolygonSymbolizer: function (value) {
        return "<sld:PolygonSymbolizer>" +
                   this.createEsriFillParams(value) +
               "</sld:PolygonSymbolizer>";
    },

    /**
     * Erzeugt ein Fill Element und liefert es zurück
     * @param  {string} value - Style Farbe
     * @return {string} sld
     */
    createEsriFillParams: function (value) {
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
    },

    setWmsSoftware: function (value) {
        this.set("wmsSoftware", value);
    }
});

export default StyleWMS;
