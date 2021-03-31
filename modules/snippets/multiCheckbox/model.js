import {convertColor} from "../../../src/utils/convertColor";
import SnippetModel from "../model";
import ValueModel from "../value/model";

const MultiCheckboxModel = SnippetModel.extend({
    defaults: {
        values: [],
        preselectedValues: []
    },

    initialize: function () {
        this.superInitialize();
        this.addValueModels(this.get("values"));
        if (this.get("preselectedValues").length > 0) {
            this.get("preselectedValues").forEach(function (preselectedValue) {
                this.updateSelectedValues(preselectedValue, true);
            }, this);
        }
        this.setValueModelsToShow(this.get("valuesCollection").where({isSelectable: true}));
        this.listenTo(this.get("valuesCollection"), {
            "change:isSelected": function () {
                this.triggerValuesChanged();
                this.trigger("render");
            }
        });
    },

    /**
     * calls addValueModel for each value
     * @param {string[]} valueList - init dropdown values
     * @returns {void}
     */
    addValueModels: function (valueList) {
        valueList.forEach(function (value) {
            this.addValueModel(value);
        }, this);
    },

    /**
     * creates a model value and adds it to the value collection
     * @param  {string} value - value
     * @returns {void}
     */
    addValueModel: function (value) {
        this.get("valuesCollection").add(new ValueModel({
            attr: this.get("name"),
            value: value,
            iconPath: this.getIconPath(value),
            displayName: value,
            isSelected: this.get("isInitialLoad") ? true : this.get("preselectedValues").indexOf(value) !== -1,
            isSelectable: true,
            type: this.get("type")
        }));
    },

    /**
     * Determines the iconPath and returns it
     * @param  {string} value - value of category to display in multiCheckbox
     * @returns {string} - path to Icon
     */
    getIconPath: function (value) {
        const layerModel = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")});
        let styleId,
            styleModel,
            iconPath = "";

        if (layerModel) {
            styleId = layerModel.get("styleId");

            if (styleId) {
                styleModel = Radio.request("StyleList", "returnModelById", styleId);
            }
        }

        if (styleModel && styleModel.getLegendInfos() && Array.isArray(styleModel.getLegendInfos())) {

            styleModel.getLegendInfos().forEach(function (legendInfo) {
                if (legendInfo.label === value) {
                    // always show icon if configured, independend of geometry type
                    if (legendInfo.styleObject.get("type") === "icon") {
                        iconPath = legendInfo.styleObject.get("imagePath") + legendInfo.styleObject.get("imageName");
                    }
                    else if (legendInfo.geometryType) {
                        if (legendInfo.geometryType === "Point") {
                            iconPath = this.createCircleSVG(styleModel);
                        }
                        else if (legendInfo.geometryType === "LineString") {
                            iconPath = this.createLineSVG(legendInfo.styleObject);
                        }
                        else if (legendInfo.geometryType === "Polygon") {
                            iconPath = this.createPolygonSVG(legendInfo.styleObject);
                        }
                    }
                }
            }.bind(this));
        }

        return iconPath;
    },

    /**
     * Creates an SVG for a polygon
     * @param   {vectorStyle} style feature styles
     * @returns {string} svg
     */
    createPolygonSVG: function (style) {
        let svg = "";
        const fillColor = style.get("polygonFillColor") ? convertColor(style.get("polygonFillColor"), "rgbString") : "black",
            strokeColor = style.get("polygonStrokeColor") ? convertColor(style.get("polygonStrokeColor"), "rgbString") : "black",
            strokeWidth = style.get("polygonStrokeWidth"),
            fillOpacity = style.get("polygonFillColor")[3] || 0,
            strokeOpacity = style.get("polygonStrokeColor")[3] || 0;

        svg += "<svg height='25' width='25'>";
        svg += "<polygon points='5,5 20,5 20,20 5,20' style='fill:";
        svg += fillColor;
        svg += ";fill-opacity:";
        svg += fillOpacity;
        svg += ";stroke:";
        svg += strokeColor;
        svg += ";stroke-opacity:";
        svg += strokeOpacity;
        svg += ";stroke-width:";
        svg += strokeWidth;
        svg += ";'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * Creates an SVG for a circle
     * @param   {vectorStyle} style feature styles
     * @returns {string} svg
     */
    createCircleSVG: function (style) {
        let svg = "";
        const circleStrokeColor = style.get("circleStrokeColor") ? convertColor(style.get("circleStrokeColor"), "rgbString") : "black",
            circleStrokeOpacity = style.get("circleStrokeColor")[3] || 0,
            circleStrokeWidth = style.get("circleStrokeWidth"),
            circleFillColor = style.get("circleFillColor") ? convertColor(style.get("circleFillColor"), "rgbString") : "black",
            circleFillOpacity = style.get("circleFillColor")[3] || 0;

        svg += "<svg height='25' width='25'>";
        svg += "<circle cx='12.5' cy='12.5' r='10' stroke='";
        svg += circleStrokeColor;
        svg += "' stroke-opacity='";
        svg += circleStrokeOpacity;
        svg += "' stroke-width='";
        svg += circleStrokeWidth;
        svg += "' fill='";
        svg += circleFillColor;
        svg += "' fill-opacity='";
        svg += circleFillOpacity;
        svg += "'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * Creates an SVG for a line
     * @param   {vectorStyle} style feature styles
     * @returns {string} svg
     */
    createLineSVG: function (style) {
        let svg = "";
        const strokeColor = style.get("lineStrokeColor") ? convertColor(style.get("lineStrokeColor"), "rgbString") : "black",
            strokeWidth = style.get("lineStrokeWidth"),
            strokeOpacity = style.get("lineStrokeColor")[3] || 0,
            strokeDash = style.get("lineStrokeDash") ? style.get("lineStrokeDash").join(" ") : undefined;

        svg += "<svg height='25' width='25'>";
        svg += "<path d='M 05 20 L 20 05' stroke='";
        svg += strokeColor;
        svg += "' stroke-opacity='";
        svg += strokeOpacity;
        svg += "' stroke-width='";
        svg += strokeWidth;
        if (strokeDash) {
            svg += "' stroke-dasharray='";
            svg += strokeDash;
        }
        svg += "' fill='none'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * resetCollection
     * @return {void}
     */
    resetValues: function () {
        const models = this.get("valuesCollection").models;

        models.forEach(function (model) {
            model.set("isSelectable", true);
        }, this);
    },

    /**
     * checks the value model if it is selected or not
     * @param {string} value - selected value in the multicheckbox list
     * @param {boolean} checked - is checkbox checked or unchecked
     * @returns {void}
     */
    updateSelectedValues: function (value, checked) {
        const models = this.get("valuesCollection").models;

        models.forEach(function (valueModel) {
            if (valueModel.get("displayName") === value.trim()) {
                valueModel.set("isSelected", checked);
            }
        });
    },

    /**
     * checks the value models if they are selectable or not
     * @param {string[]} values - filtered values
     * @fires MultiCheckboxView#render
     * @returns {void}
     */
    updateSelectableValues: function (values) {
        this.get("valuesCollection").each(function (valueModel) {
            if ((!Array.isArray(values) || values.indexOf(valueModel.get("value")) === -1) && !valueModel.get("isSelected")) {
                valueModel.set("isSelectable", false);
            }
            else {
                valueModel.set("isSelectable", true);
            }
        }, this);

        this.setValueModelsToShow(this.get("valuesCollection").where({isSelectable: true}));
        this.trigger("render");
    },
    /**
     * sets the valueModelsToShow attribute
     * @param  {Backbone.Model[]} value - all value models that can be selected
     * @returns {void}
     */
    setValueModelsToShow: function (value) {
        this.set("valueModelsToShow", value);
    },

    getSelectedValues: function () {
        const selectedModels = this.get("valuesCollection").where({isSelected: true}),
            obj = {
                attrName: this.get("name"),
                type: this.get("type"),
                values: []
            };

        if (selectedModels.length > 0) {
            selectedModels.forEach(function (model) {
                obj.values.push(model.get("value"));
            });
        }
        return obj;
    },
    setDisplayName: function (value) {
        this.set("displayName", value);
    }
});

export default MultiCheckboxModel;
