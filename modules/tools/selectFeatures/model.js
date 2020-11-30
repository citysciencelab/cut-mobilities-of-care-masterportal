import {Select, DragBox} from "ol/interaction";
import {platformModifierKeyOnly} from "ol/events/condition";
import VectorSource from "ol/source/Vector.js";
import {never} from "ol/events/condition";

import Tool from "../../core/modelList/tool/model";
import {isUrl} from "../../../src/utils/urlHelper";

/**
 * Feature zipped with its properties prepared for display (aka beautified).
 * @typedef {object} featureWithRenderInformation
 * @property {ol:module/Feature} feature that is supposed to get an entry
 * @property {Array.<string[]>} properties [key, value] pairs prepared for tabular display
 * @memberof Tools.SelectFeatures
 */

const SelectFeaturesTool = Tool.extend(/** @lends SelectFeaturesTool.prototype */ {
    defaults: {
        ...Tool.prototype.defaults,
        selectedFeatures: undefined,
        selectedFeaturesWithRenderInformation: [],
        select: undefined,
        dragBox: undefined,
        // display strings
        propertylessFeature: "",
        noFeatureChosen: "",
        zoomToFeature: "",
        currentLng: ""
    },

    /**
     * @class SelectFeaturesModel
     * @extends Tool
     * @memberof Tools.SelectFeatures
     * @constructs
     * @property {module:ol/Collection} selectedFeatures collection of selected features
     * @property {featureWithRenderInformation[]} selectedFeaturesWithRenderInformation render-ready feature zip
     * @property {module:ol/interaction/Select} select select interaction for deselection behaviour
     * @property {module:ol/interaction/DragBox} dragBox drag box interaction to select features
     * @property {string} [propertylessFeature=""] current display translation
     * @property {string} [noFeatureChosen=""] current display translation
     * @property {string} [zoomToFeature=""] current display translation
     * @property {string} [currentLng=""] current display language
     * @fires Tools.SelectFeaturesModel#updatedSelection
     * @fires Tools.SelectFeatures#changeIsActive
     * @fires Core#RadioTriggerMapAddInteraction
     * @fires Core#RadioTriggerMapRemoveInteraction
     * @listens Tools.SelectFeatures#RadioRequestGetSelectedFeatures
     * @listens Tools.SelectFeatures#changeIsActive
     * @listens Core#RadioRequestUtilGetIgnoredKeys
     * @listens i18next#RadioTriggerLanguageChanged
     */
    initialize: function () {
        this.superInitialize();
        this.createInteractions();
        this.listenTo(this, {"change:isActive": this.changeIsActive});
        this.listenTo(Radio.channel("i18next"), {"languageChanged": this.changeLanguage});
        this.changeLanguage();
    },

    /**
     * Translates the parameters of this class to the given language.
     * @param {string} lng current language key
     * @returns {void}
     */
    changeLanguage: function (lng) {
        this.set({
            "propertylessFeature": i18next.t("common:modules.tools.selectFeatures.propertylessFeature"),
            "noFeatureChosen": i18next.t("common:modules.tools.selectFeatures.noFeatureChosen"),
            "zoomToFeature": i18next.t("common:modules.tools.selectFeatures.zoomToFeature"),
            "currentLng": lng
        });
    },

    /**
     * Creates the interactions for selecting features.
     * @returns {void}
     */
    createInteractions: function () {
        const select = new Select({
                // select works indirectly via DragBox results - never updates itself
                addCondition: never,
                removeCondition: never,
                toggleCondition: never,
                condition: never
            }),
            dragBox = new DragBox({condition: platformModifierKeyOnly});

        this.setSelectedFeatures(select.getFeatures());

        dragBox.on("boxstart", this.clearFeatures.bind(this));
        dragBox.on("boxend", this.setFeaturesFromDrag.bind(this));

        this.setSelectInteraction(select);
        this.setDragBoxInteraction(dragBox);
    },

    /**
     * Sets collection of selected features to model.
     * @param {Collection} selectedFeatures selected features collection
     * @returns {void}
     */
    setSelectedFeatures: function (selectedFeatures) {
        this.set("selectedFeatures", selectedFeatures);
    },

    /**
     * Sets an array of feature/properties-objects to the model.
     * @param {featureWithRenderInformation[]} array features for render
     * @returns {void}
     */
    setSelectedFeaturesWithRenderInformation: function (array) {
        this.set("selectedFeaturesWithRenderInformation", array);
    },

    /**
     * Gets a feature or multiple features and forwards it/them to the pushFeatures Function.
     * Also pushes the features to the selected features.
     * @param {module:ol/Layer} layer layer the feature belongs to (for gfi attributes)
     * @param {module:ol/Feature} feature feature to be pushed
     * @returns {void}
     */
    prepareFeature: function (layer, feature) {
        this.get("selectedFeatures").push(feature);
        if (feature.get("features") === undefined) {
            const item = feature;

            this.pushFeatures(layer, item);
        }
        else {
            feature.get("features").forEach(item => {
                this.pushFeatures(layer, item);
            });
        }
    },

    /**
     * Pushes the given feature and its properties to the selectedFeaturesWithRenderInformation array.
     * @param {module:ol/Layer} layer layer the feature belongs to (for gfi attributes)
     * @param {module:ol/Feature} item feature to be pushed
     * @returns {void}
     */
    pushFeatures: function (layer, item) {
        this.get("selectedFeaturesWithRenderInformation").push({
            item,
            properties: this.translateGFI(
                item.getProperties(),
                layer.get("gfiAttributes")
            )
        });
    },


    /**
     * Infers features from interaction state and sets them to the selectedFeatures.
     * @returns {void}
     */
    setFeaturesFromDrag: function () {
        const extent = this.get("dragBox").getGeometry().getExtent();

        Radio
            .request("Map", "getLayers")
            .getArray()
            .filter(l => l.get("visible") && l.get("source") instanceof VectorSource)
            .forEach(
                l => l.get("source").forEachFeatureIntersectingExtent(
                    extent,
                    feature => this.prepareFeature(l, feature)
                )
            );

        Radio.trigger(this, "updatedSelection");
    },

    /**
     * Clears the selected features of all current instances.
     * @returns {void}
     */
    clearFeatures: function () {
        this.get("selectedFeatures").clear();
        this.setSelectedFeaturesWithRenderInformation([]);
    },

    /**
     * Adds/Removes interactions depending on whether tool is active.
     * @param {object} _ model, not used
     * @param {boolean} isActive whether tool is active
     * @returns {void}
     */
    changeIsActive: function (_, isActive) {
        if (isActive) {
            this.addInteractions();
        }
        else {
            this.removeInteractions();
        }
    },

    /**
     * Adds the interactions to the Map.
     * @returns {void}
     */
    addInteractions: function () {
        Radio.trigger("Map", "addInteraction", this.get("select"));
        Radio.trigger("Map", "addInteraction", this.get("dragBox"));
    },

    /**
     * Removes the Interactions from the Map.
     * @returns {void}
     */
    removeInteractions: function () {
        Radio.trigger("Map", "removeInteraction", this.get("select"));
        Radio.trigger("Map", "removeInteraction", this.get("dragBox"));
    },

    /**
     * @param {DragBox} dragBox dragBox to be set to model
     * @returns {void}
     */
    setDragBoxInteraction: function (dragBox) {
        this.set("dragBox", dragBox);
    },

    /**
     * @param {Select} select select to be set to model
     * @returns {void}
     */
    setSelectInteraction: function (select) {
        this.set("select", select);
    },

    /**
     * Prepares the properties of a feature for tabular display.
     * @param {object} properties Technical key to display value
     * @param {object} gfiAttributes Technical key to display key
     * @returns {Array.<string[]>} Array of [key,value]-pairs - may be empty
     */
    translateGFI: function (properties, gfiAttributes) {
        // makes links in result list clickable
        Object.entries(properties).forEach(([key, value]) => {
            if (typeof value === "string" && isUrl(value)) {
                properties[key] = "<a href=" + value + " target=\"_blank\">" + value + "</a>";
            }
        });
        // showAll => just use properties and make key look nice
        if (gfiAttributes === "showAll") {
            return Object
                .entries(properties)
                .map(([key, value]) => {
                    if (this.isValidKey(key) && this.isValidValue(value)) {
                        return [this.beautifyKey(key), this.beautifyValue(value)];
                    }
                    return false;
                })
                // filter "false" entries that did not pass checks
                .filter(entry => entry);
        }

        // type object => contains pretty-print instruction for key as value
        if (typeof gfiAttributes === "object") {
            return Object
                .keys(gfiAttributes)
                .map(key => [
                    gfiAttributes[key],
                    this.beautifyValue(properties[key] || "")
                ]);
        }

        // gfiAttributes === "ignore" (or invalid)
        if (gfiAttributes !== "ignore") {
            console.warn(`Layer has invalid gfiAttributes "${gfiAttributes}". Acting as if "ignore" was given.`);
        }

        return [];
    },

    /**
     * Prepares a key for display.
     * e.g. "very_important_field" becomes "Very Important Field"
     * @param {string} str key to beautify
     * @returns {string} beautified key
     */
    beautifyKey: function (str) {
        return str
            .split("_")
            .map(s => s.substring(0, 1).toUpperCase() + s.substring(1))
            .join(" ");
    },

    /**
     * Translates | separators to newlines.
     * @param {String} str string, potentially with separators '|'
     * @returns {string} beautified string
     */
    beautifyValue: function (str) {
        return str
            .split("|")
            .map(s => s.trim())
            .join("<br/>");
    },

    /**
     * helper function: check, if key has a valid value
     * @param {string} key parameter
     * @returns {boolean} desc
     */
    isValidKey: function (key) {
        const ignoredKeys = Config.ignoredKeys ? Config.ignoredKeys : Radio.request("Util", "getIgnoredKeys");

        return ignoredKeys.indexOf(key.toUpperCase()) === -1;
    },

    /**
     * helper function: check, if str has a valid value
     * @param {string} str parameter
     * @returns {boolean} desc
     */
    isValidValue: function (str) {
        return Boolean(str && typeof str === "string" && str.toUpperCase() !== "NULL");
    }
});

export default SelectFeaturesTool;
