define([
    "backbone",
    "eventbus",
    "backbone.radio"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        EventBus = require("eventbus"),
        StyleWMS;

    StyleWMS = Backbone.Model.extend({
        defaults: {
            sldHeader: "<sld:StyledLayerDescriptor version='1.0.0' xmlns:sld='http://www.opengis.net/sld' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>",
            layerId: "default",
            attributeName: "default",
            numberOfClasses: "default",
            numberOfClassesList: ["1", "2", "3", "4", "5"]
        },

        /**
         * [initialize description]
         * @return {[type]} [description]
         */
        initialize: function () {
            this.listenTo(EventBus, {
                "winParams": this.setStatus
            });

            this.listenTo(this, {
                "change:isCurrentWin": this.getLayerForStyle,
                "change:layerId": this.getLayerById,
                "change:styleClassAttributes": this.createSLDBody,
                "change:setSLDBody": function () {
                    EventBus.trigger("layerlist:setAttributionsByID", "4441", {"SLDBody": this.getSLDBody()});
                }
            });
        },

        validate: function (attributes) {
            var prevMax = -1,
                errors = [],
                regExp = new RegExp("^[0-9]+$");

            _.each(attributes.styleClassAttributes, function (element, index) {
                var min = parseInt(element.startRange, 10),
                    max = parseInt(element.stopRange, 10);
console.log(element.color);
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

            this.set("errors", errors);
            if (_.isEmpty(errors) === false) {
                return errors;
            }
        },

        getErrors: function () {
            return this.get("errors");
        },

        /**
         * [setStatus description]
         * @param {[type]} args [description]
         */
        setStatus: function (args) {
            if (args[2] === "styleWMS") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },

        /**
         * [getLayerForStyle description]
         * @param  {[type]} model [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        getLayerForStyle: function (model, value) {
            if (value === true) {
                var layers = Radio.request("LayerList", "getLayerListWhere", {styleable: true});

                this.setLayers(layers);
            }
        },

        /**
         * [getLayerById description]
         * @return {[type]} [description]
         */
        getLayerById: function () {
            var layer = _.filter(this.getLayers(), function (layer) {
                return layer.id === this.getLayerId();
            }, this);

            this.setLayer(layer[0]);
        },

        /**
         * [setLayers description]
         * @param {[type]} value [description]
         */
        setLayers: function (value) {
            this.set("layers", value);
        },

        setLayer: function (value) {
            this.set("layer", value);
        },

        setLayerId: function (value) {
            this.set("layerId", value);
        },

        setAttributeName: function (value) {
            this.set("attributeName", value);
        },

        setNumberOfClasses: function (value) {
            this.set("numberOfClasses", value);
        },

        setSLDBody: function (value) {
            this.set("setSLDBody", value);
        },

        setStyleClassAttributes: function (value) {
            this.set("styleClassAttributes", value, {validate: true});
        },

        getStyleClassAtributes: function () {
            return this.get("styleClassAttributes");
        },

        getSLDBody: function () {
            return this.get("setSLDBody");
        },

        getLayers: function () {
            return this.get("layers");
        },

        getLayerId: function () {
            return this.get("layerId");
        },

        getAttributeName: function () {
            return this.get("attributeName");
        },

        getRule: function (col, from, to) {
            return this.getAndFilter(from, to) + this.getPolygonSymbolizer(col);
        },

        getPolygonSymbolizer: function (value) {
            return "<sld:PolygonSymbolizer>" + this.getFillParams(value) + "</sld:PolygonSymbolizer>";
        },

        getFillParams: function (value) {
            return "<sld:Fill><sld:CssParameter name='fill'>" + value + "</sld:CssParameter></sld:Fill>";
        },

        getAndFilter: function (value1, value2) {
            return "<ogc:Filter><ogc:And>" + this.getPropertyIsGreaterThanOrEqualTo(value1) + this.getPropertyIsLessThanOrEqualTo(value2) + "</ogc:And></ogc:Filter>";
        },

        getPropertyIsGreaterThanOrEqualTo: function (value) {
            return "<ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>" + this.getAttributeName() + "</ogc:PropertyName><ogc:Literal>" + value + "</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo>";
        },

        getPropertyIsLessThanOrEqualTo: function (value) {
            return "<ogc:PropertyIsLessThanOrEqualTo><ogc:PropertyName>" + this.getAttributeName() + "</ogc:PropertyName><ogc:Literal>" + value + "</ogc:Literal></ogc:PropertyIsLessThanOrEqualTo>";
        },

        getSLDHeader: function () {
            return this.get("sldHeader");
        },

        createSLDBody: function () {
            var header = this.getSLDHeader() + "<sld:NamedLayer><sld:Name>6</sld:Name><sld:UserStyle><sld:Name>erreichbarkeitCustomStyle</sld:Name><sld:FeatureTypeStyle>";

                _.each(this.getStyleClassAtributes(), function (obj) {
                    var rule = "<sld:Rule>" + this.getRule(obj.color, obj.startRange, obj.stopRange) + "</sld:Rule>";

                    header += rule;
                }, this);

            header += "</sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>";
            console.log(header);
            this.setSLDBody(header);
        }
    });

    return StyleWMS;
});
