import {GeoJSON} from "ol/format.js";
import {fromCircle} from "ol/geom/Polygon.js";

const actions = {
    /**
     * change language - sets default values for the language
     * @param {Object} state - vuex state
     * @returns {Void}  -
     */
    changeLang: function ({state}) {
        state.displayName = i18next.t("common:snippets.graphicalSelect.displayName");
        state.tooltipMessage = i18next.t("common:snippets.graphicalSelect.tooltipMessage");
        state.tooltipMessagePolygon = i18next.t("common:snippets.graphicalSelect.tooltipMessagePolygon");
    },

    /**
     * Sets listeners for draw interaction events. On "drawend" the selected area is stored as geoJSON in the model-property "selectedAreaGeoJson".
     * @param {Object} dispatch commit vuex element
     * @param {Object} payload payload.interaction - Interaction for drawing feature geometries, payload.layer - Vector data that is rendered client-side
     * @returns {void}
     */
    setDrawInteractionListener: async function ({dispatch, commit}, payload) {
        payload.interaction.on("drawstart", function () {
            // remove alert of "more than X tiles"
            Radio.trigger("Alert", "alert:remove");
            payload.layer.getSource().clear();
        });

        payload.interaction.on("drawend", async function (evt) {
            const geoJson = await dispatch("featureToGeoJson", evt.feature);

            commit("setSelectedAreaGeoJson", geoJson);
            // emit event onDrawEnd with geoJson value
            payload.vm.$parent.$parent.$emit("onDrawEnd", geoJson);
        });

    },

    /**
    * Converts a feature to a geojson.
    * If the feature geometry is a circle, it is converted to a polygon.
    * @param {Object} context commit vuex element
    * @param {ol.Feature} feature - drawn feature
    * @returns {object} GeoJSON
    */
    featureToGeoJson: async function (context, feature) {
        const reader = new GeoJSON(),
            geometry = feature.getGeometry();

        if (geometry.getType() === "Circle") {
            feature.setGeometry(fromCircle(geometry));
        }

        return reader.writeGeometryObject(feature.getGeometry());
    },

    /**
     * Shows tooltips at position of the event.
     * @param {Object} state vuex element
     * @param {Object} rootState vuex element
     * @returns {void}
     */
    showTooltipOverlay: function ({state, rootState}) {
        const coords = rootState.Map.mouseCoord,
            tooltipOverlay = state.tooltipOverlay,
            currentValue = state.currentValue;

        if (currentValue === "Polygon") {
            tooltipOverlay.element.innerHTML = state.tooltipMessagePolygon;
        }
        else {
            tooltipOverlay.element.innerHTML = state.tooltipMessage;
        }
        tooltipOverlay.setPosition(coords);
    },

    /**
     * Adds or removes the circle overlay from the map.
     * @param {Object} context vuex element
     * @param {Object} payload payload.type - geometry type, payload.overlay - circleOverlay
     * @todo Replace if removeOverlay, addOverlay is available in vue
     * @fires Core#RadioTriggerMapAddOverlay
     * @fires Core#RadioTriggerMapRemoveOverlay
     * @returns {void}
     */
    toggleOverlay: function (context, payload) {
        if (payload.type === "Circle") {
            Radio.trigger("Map", "addOverlay", payload.overlayCircle);
        }
        else {
            Radio.trigger("Map", "removeOverlay", payload.overlayCircle);
            Radio.trigger("Map", "addOverlay", payload.overlayTool);
        }
    },

    /**
     * Creates a div element for the circle overlay
     * and adds it to the overlay.
     * @param {Object} context vuex element
     * @param {Object} payload payload.id - id of the div to create, payload.overlay - circleOverlay
     * @returns {void}
     */
    createDomOverlay: function (context, payload) {
        const element = document.createElement("div");

        element.id = payload.id;
        payload.overlay.element = element;
    }
};

export default actions;
