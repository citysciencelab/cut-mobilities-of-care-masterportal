import SnippetDropdownModel from "../dropdown/model";
import Overlay from "ol/Overlay.js";
import { GeoJSON } from "ol/format.js";
import { fromCircle } from "ol/geom/Polygon.js";
import { Draw } from "ol/interaction.js";
import { createBox } from "ol/interaction/Draw.js";
import { Circle } from "ol/geom.js";

const GraphicalSelectModel = SnippetDropdownModel.extend(/** @lends GraphicalSelectModel.prototype */{
    /**
     * @class GraphicalSelectModel
     * @extends DropdownModel
     * @memberof Snippets.GraphicalSelect
     * @constructs
     */
    defaults: {
        isOpen: false,
        name: "Geometrie",
        type: "string",
        displayName: "Geometrie auswählen",
        snippetType: "dropdown",
        isMultiple: false,
        drawInteraction: undefined,
        circleOverlay: new Overlay({
            offset: [15, 0],
            positioning: "center-left"
        }),
        tooltipOverlay: new Overlay({
            offset: [15, 20],
            positioning: "top-left"
        }),
        snippetDropdownModel: {},
        geographicValues: {
            "Rechteck aufziehen": "Box",
            "Kreis aufziehen": "Circle",
            "Fläche zeichnen": "Polygon"
        },
        currentValue: "",
        selectedAreaGeoJson: {},
        tooltipMessage: "Klicken zum Starten und Beenden",
        tooltipMessagePolygon: "Klicken um Stützpunkt hinzuzufügen",
    },

    initialize: function () {
        this.superInitialize();
        const channel = Radio.channel("GraphicalSelect");
        channel.on({
            "setStatus": this.setStatus,
            "resetView": this.resetView
        }, this);
        channel.reply({
            "featureToGeoJson": function (feature) {
                return this.featureToGeoJson(feature);
            }
        }, this);
        this.listenTo(this, {
            "change:isActive": this.setStatus
        });
        this.listenTo(this.snippetDropdownModel, {
            "valuesChanged": function () {
                this.createDrawInteraction();
            }
        });
        this.createDomOverlay("circle-overlay", this.get("circleOverlay"));
        this.createDomOverlay("tooltip-overlay", this.get("tooltipOverlay"));
        this.setDropDownSnippet(new SnippetDropdownModel({
            name: this.get('name'),
            type: this.get('type'),
            displayName: this.get('displayName'),
            values: _.allKeys(this.get("geographicValues")),
            snippetType:this.get('snippetType'),
            isMultiple: this.get('isMultiple'),
            preselectedValues: _.allKeys(this.get("geographicValues"))[0]
        }));

    },
    /**
      * Handles (de-)activation of this Tool
      * @param {object} model - tool model
      * @param {boolean} value flag is tool is ctive
      * @fires Core#RadioTriggerMapRemoveOverlay
      * @returns {void}
      */
    setStatus: function (model, value) {
        let selectedValues;

        if (value) {
            selectedValues = this.get("snippetDropdownModel").getSelectedValues();
            this.createDrawInteraction(selectedValues.values[0] || _.allKeys(this.get("geographicValues"))[0]);
        }
        else {
            if (!_.isUndefined(this.get("drawInteraction"))) {
                this.get("drawInteraction").setActive(false);
            }
            Radio.trigger("Map", "removeOverlay", this.get("circleOverlay"));
            Radio.trigger("Map", "removeOverlay", this.get("tooltipOverlay"));
        }
    },

    resetGeographicSelection: function () {
        this.get("snippetDropdownModel").updateSelectedValues(_.allKeys(this.get("geographicValues"))[0]);
    },

    /**
     * creates a draw interaction and adds it to the map.
     * @param {string} drawType - drawing type (Box | Circle | Polygon)
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires Core#RadioTriggerMapAddOverlay
     * @fires Core#RadioTriggerMapRegisterListener
     * @fires Core#RadioTriggerMapAddInteraction
     * @returns {void}
     */
    createDrawInteraction: function (drawType) {
        this.resetView();
        let that = this,
            value = this.get("geographicValues")[drawType],
            layer = Radio.request("Map", "createLayerIfNotExists", "ewt_draw_layer"),
            createBoxFunc = createBox(),
            drawInteraction = new Draw({
                // destination for drawn features
                source: layer.getSource(),
                // drawing type
                // a circle with four points is internnaly used as Box, since type "Box" does not exist
                type: value === "Box" ? "Circle" : value,
                // is called when a geometry's coordinates are updated
                geometryFunction: value === "Polygon" ? undefined : function (coordinates, opt_geom) {
                    if (value === "Box") {
                        return createBoxFunc(coordinates, opt_geom);
                    }
                    // value === "Circle"
                    return that.snapRadiusToInterval(coordinates, opt_geom);
                }
            });

        this.setCurrentValue(value);
        this.toggleOverlay(value, this.get("circleOverlay"));
        Radio.trigger("Map", "addOverlay", this.get("tooltipOverlay"));

        this.setDrawInteractionListener(drawInteraction, layer);
        this.setDrawInteraction(drawInteraction);
        Radio.trigger("Map", "registerListener", "pointermove", this.showTooltipOverlay.bind(this), this);
        Radio.trigger("Map", "addInteraction", drawInteraction);
    },
    /**
     * todo
     * @param {*} coordinates todo
     * @param {*} opt_geom todo
     * @returns {*} todo
     */
    snapRadiusToInterval: function (coordinates, opt_geom) {
        let radius = Math.sqrt(Math.pow(coordinates[1][0] - coordinates[0][0], 2) + Math.pow(coordinates[1][1] - coordinates[0][1], 2));
        let geometry;

        radius = this.precisionRound(radius, -1);
        geometry = opt_geom || new Circle(coordinates[0]);
        geometry.setRadius(radius);

        this.showOverlayOnSketch(radius, coordinates[1]);
        return geometry;
    },

    /**
     * sets listeners for draw interaction events
     * @param {ol.interaction.Draw} interaction - todo
     * @param {ol.layer.Vector} layer - todo
     * @returns {void}
     */
    setDrawInteractionListener: function (interaction, layer) {
        const that = this;

        interaction.on("drawstart", function () {
            //remove alert of "more than 9 kacheln"
            Radio.trigger("Alert", "alert:remove");
            layer.getSource().clear();
        }, this);

        interaction.on("drawend", function (evt) {
            const geoJson = that.featureToGeoJson(evt.feature);
            that.setSelectedAreaGeoJson(geoJson);
        }, this);

        interaction.on("change:active", function (evt) {
            if (evt.oldValue) {
                layer.getSource().clear();
                Radio.trigger("Map", "removeInteraction", evt.target);
            }
        });
    },

    /**
* converts a feature to a geojson
* if the feature geometry is a circle, it is converted to a polygon
* @param {ol.Feature} feature - drawn feature
* @returns {object} GeoJSON
*/
    featureToGeoJson: function (feature) {
        const reader = new GeoJSON(),
            geometry = feature.getGeometry();

        if (geometry.getType() === "Circle") {
            feature.setGeometry(fromCircle(geometry));
        }
        return reader.writeGeometryObject(feature.getGeometry());
    },

    /**
     * Used to hide Geometry and Textoverlays if request was unsuccessful for any reason
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires Core#RadioTriggerMapRemoveOverlay
     * @returns {void}
     */
    resetView: function () {
        const layer = Radio.request("Map", "createLayerIfNotExists", "ewt_draw_layer");
        if (layer) {
            layer.getSource().clear();
            Radio.trigger("Map", "removeOverlay", this.get("circleOverlay"));
        }
        this.resetGeographicSelection();
        this.setStatus(this.model, false);
    },

    /**
     * Chooses unit based on value, calls panctuate and converts to unit and appends unit
     * @param  {number} value -
     * @param  {number} maxDecimals - decimals are cut after maxlength chars
     * @fires Core#RadioRequestUtilPunctuate
     * @returns {string} unit
     */
    chooseUnitAndPunctuate: function (value, maxDecimals) {
        let newValue;

        if (value < 250000) {
            return Radio.request("Util", "punctuate", value.toFixed(maxDecimals)) + " m²";
        }
        if (value < 10000000) {
            newValue = value / 10000.0;

            return Radio.request("Util", "punctuate", newValue.toFixed(maxDecimals)) + " ha";
        }
        newValue = value / 1000000.0;

        return Radio.request("Util", "punctuate", newValue.toFixed(maxDecimals)) + " km²";
    },



    /**
     * Iterates ofer response properties
     * @param  {object} response - todo
     * @fires Core#RadioRequestUtilPunctuate
     * @returns {void}
     */
    prepareDataForRendering: function (response) {
        _.each(response, function (value, key, list) {
            let stringVal = "";

            if (!isNaN(value)) {
                if (key === "suchflaeche") {
                    stringVal = this.chooseUnitAndPunctuate(value);
                }
                else {
                    stringVal = Radio.request("Util", "punctuate", value);
                }
                list[key] = stringVal;
            }
            else {
                list[key] = value;
            }

        }, this);
    },

    /**
     * calculates the circle radius and places the circle overlay on geometry change
     * @param {number} radius - circle radius
     * @param {number[]} coords - point coordinate
     * @returns {void}
     */
    showOverlayOnSketch: function (radius, coords) {
        const circleOverlay = this.get("circleOverlay");

        circleOverlay.getElement().innerHTML = this.roundRadius(radius);
        circleOverlay.setPosition(coords);
    },

    /**
     * todo
     * @param {*} evt todo
     * @returns {void}
     */
    showTooltipOverlay: function (evt) {
        const coords = evt.coordinate,
            tooltipOverlay = this.get("tooltipOverlay"),
            currentValue = this.get("currentValue");

        if (currentValue === "Polygon") {
            tooltipOverlay.getElement().innerHTML = this.get("tooltipMessagePolygon");
        }
        else {
            tooltipOverlay.getElement().innerHTML = this.get("tooltipMessage");
        }
        tooltipOverlay.setPosition(coords);
    },

    /**
     * todo
     * @param {Number} number todo
     * @param {*} precision todo
     * @returns {Number} todo
     */
    precisionRound: function (number, precision) {
        const factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
    },


    /**
     * adds or removes the circle overlay from the map
     * @param {string} type - geometry type
     * @param {ol.Overlay} overlay - circleOverlay
     * @fires Core#RadioTriggerMapAddOverlay
     * @fires Core#RadioTriggerMapRemoveOverlay
     * @returns {void}
     */
    toggleOverlay: function (type, overlay) {
        if (type === "Circle") {
            Radio.trigger("Map", "addOverlay", overlay);
        }
        else {
            Radio.trigger("Map", "removeOverlay", overlay);
        }
    },

    /**
     * rounds the circle radius
     * @param {number} radius - circle radius
     * @return {string} the rounded radius
     */
    roundRadius: function (radius) {
        if (radius > 500) {
            return (Math.round(radius / 1000 * 100) / 100) + " km";
        }
        return (Math.round(radius * 10) / 10) + " m";
    },

    /**
     * creates a div element for the circle overlay
     * and adds it to the overlay
     * @param {string} id -
     * @param {ol.Overlay} overlay - circleOverlay
     * @returns {void}
     */
    createDomOverlay: function (id, overlay) {
        const element = document.createElement("div");
        element.setAttribute("id", id);
        overlay.setElement(element);
    },

    /**
     * checks if snippetCheckboxLayer is loaded and toggles the button accordingly
     * @param {String} layerId - id of the addressLayer
     * @param {SnippetCheckboxModel} snippetCheckboxModel - snbippet checkbox model for a layer
     * @fires Core#RadioRequestModelListGetModelByAttributes
     * @returns {void}
     */
    checksSnippetCheckboxLayerIsLoaded: function (layerId, snippetCheckboxModel) {
        const model = Radio.request("ModelList", "getModelByAttributes", { id: layerId }),
            isVisibleInMap = !_.isUndefined(model) ? model.get("isVisibleInMap") : false;

        if (isVisibleInMap) {
            snippetCheckboxModel.setIsSelected(true);
        }
        else {
            snippetCheckboxModel.setIsSelected(false);
        }
    },
    /**
     * Sets the currentValue
     * @param {*} value todo
     * @returns {void}
     */
    setCurrentValue: function (value) {
        this.set("currentValue", value);
    },
    /**
     * Sets the snippetDropdownModel
     * @param {*} value todo
     * @returns {void}
     */
    setDropDownSnippet: function (value) {
        this.set("snippetDropdownModel", value);
    },
    /**
     * Sets the drawInteraction
     * @param {*} value todo
     * @returns {void}
     */
    setDrawInteraction: function (value) {
        this.set("drawInteraction", value);
    },
     /**
     * Sets the selectedAreaGeoJson
     * @param {*} value todo
     * @returns {void}
     */
    setSelectedAreaGeoJson: function (value) {
        this.set("selectedAreaGeoJson", value);
    }

});

export default GraphicalSelectModel;
