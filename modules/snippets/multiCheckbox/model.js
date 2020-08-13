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
        const isNewVectorStyle = Config.hasOwnProperty("useVectorStyleBeta") && Config.useVectorStyleBeta ? Config.useVectorStyleBeta : false;

        this.get("valuesCollection").add(new ValueModel({
            attr: this.get("name"),
            value: value,
            iconPath: isNewVectorStyle ? this.getIconPath() : this.getIconPathOld(value),
            displayName: value,
            isSelected: this.get("isInitialLoad") ? true : this.get("preselectedValues").indexOf(value) !== -1,
            isSelectable: true,
            type: this.get("type")
        }));
    },

    /**
     * Determines the iconPath and returns it
     * @returns {string} - path to Icon
     */
    getIconPath: function () {
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

            styleModel.getLegendInfos().forEach(legendInfo => {
                if (legendInfo.geometryType) {
                    if (legendInfo.geometryType === "Point") {
                        const type = legendInfo.styleObject.get("type");

                        if (type === "icon") {
                            iconPath = legendInfo.styleObject.get("imagePath") + legendInfo.styleObject.get("imageName");
                        }
                        else if (type === "circle") {
                            iconPath = this.createCircleSVG(styleModel);
                        }
                    }
                    else if (legendInfo.geometryType === "LineString") {
                        iconPath = this.createLineSVG(legendInfo.styleObject);
                    }
                    else if (legendInfo.geometryType === "Polygon") {
                        iconPath = this.createPolygonSVG(legendInfo.styleObject);
                    }
                }
            });
        }

        return iconPath;
    },

    /**
     * Creates a SVG of a polygon
     * @param  {object} style style of the feature
     * @return {string} the created svg
     */
    createPolygonSVG: function (style) {
        let svg = "";
        const polygonFillColor = style.get("polygonFillColor"),
            fillColor = this.rgbToHex(parseInt(polygonFillColor[0], 10), parseInt(polygonFillColor[1], 10), parseInt(polygonFillColor[2], 10)),
            polygonStrokeColor = style.get("polygonStrokeColor"),
            strokeColor = this.rgbToHex(parseInt(polygonStrokeColor[0], 10), parseInt(polygonStrokeColor[1], 10), parseInt(polygonStrokeColor[2], 10)),
            strokeWidth = parseInt(style.get("polygonStrokeWidth"), 10),
            fillOpacity = style.get("polygonFillColor")[3].toString() || 0,
            strokeOpacity = style.get("polygonStrokeColor")[3].toString() || 0;

        svg += "<svg height='35' width='35'>";
        svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
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
     * Creates a SVG of a line
     * @param  {object} style style of the feature
     * @return {string} the created svg
     */
    createLineSVG: function (style) {
        let svg = "";
        const lineStrokeColor = style.get("lineStrokeColor"),
            strokeColor = this.rgbToHex(parseInt(lineStrokeColor[0], 10), parseInt(lineStrokeColor[1], 10), parseInt(lineStrokeColor[2], 10)),
            strokeWidth = parseInt(style.get("lineStrokeWidth"), 10),
            strokeOpacity = parseInt(lineStrokeColor[3], 10).toString() || 0;

        svg += "<svg height='35' width='35'>";
        svg += "<path d='M 05 30 L 30 05' stroke='";
        svg += strokeColor;
        svg += "' stroke-opacity='";
        svg += strokeOpacity;
        svg += "' stroke-width='";
        svg += strokeWidth;
        svg += "' fill='none'/>";
        svg += "</svg>";

        return svg;
    },
    /**
     * Creates a SVG of a circle
     * @param  {object} style style of the feature
     * @return {string} the created svg
     */
    createCircleSVG: function (style) {
        let svg = "";
        const circleStrokeColor = style.get("circleStrokeColor"),
            circleStrokeColorHex = this.rgbToHex(parseInt(circleStrokeColor[0], 10), parseInt(circleStrokeColor[1], 10), parseInt(circleStrokeColor[2], 10)),
            circleStrokeOpacity = style.get("circleStrokeColor")[3].toString() || 0,
            circleStrokeWidth = style.get("circleStrokeWidth"),
            circleFillColor = style.returnColor(style.get("circleFillColor"), "hex"),
            circleFillOpacity = style.get("circleFillColor")[3].toString() || 0;

        svg += "<svg height='35' width='35'>";
        svg += "<circle cx='17.5' cy='17.5' r='15' stroke='";
        svg += circleStrokeColorHex;
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
     * Returns the RGB color as HEX.
     * @param {number} red of the RGB
     * @param {number} green  of the RGB
     * @param {number} blue  of the RGB
     * @returns {string} the hex value
     */
    rgbToHex: function (red, green, blue) {
        return "#" + this.componentToHex(red) + this.componentToHex(green) + this.componentToHex(blue);
    },

    /**
     * Returns the color as hex part
     * @param {*} color part of the RGB color
     * @returns {string} hex part of the color
     */
    componentToHex: function (color) {
        const hex = color.toString(16);

        return hex.length === 1 ? "0" + hex : hex;
    },

    /**
     * creates a model value and adds it to the value collection
     * @deprecated with new vectorStyle module
     * @param  {string} value - value
     * @returns {string} - path to Icon
     */
    getIconPathOld: function (value) {
        const layerModel = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")});
        let styleId,
            styleModel,
            valueStyle,
            iconPath;

        if (layerModel) {
            styleId = layerModel.get("styleId");

            if (styleId) {
                styleModel = Radio.request("StyleList", "returnModelById", styleId);
            }
        }

        if (styleModel) {
            valueStyle = styleModel.get("styleFieldValues").filter(function (styleFieldValue) {
                return styleFieldValue.styleFieldValue === value;
            });
        }

        if (valueStyle) {
            iconPath = styleModel.get("imagePath") + valueStyle[0].imageName;
        }

        return iconPath;
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
