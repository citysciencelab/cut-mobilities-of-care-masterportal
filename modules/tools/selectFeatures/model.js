import Tool from "../../core/modelList/tool/model";
import {Select, DragBox} from "ol/interaction";
import {platformModifierKeyOnly} from "ol/events/condition";
import Requestor from "../../core/requestor";

const SelectFeaturesTool = Tool.extend(/** @lends SelectFeaturesTool.prototype */ {
    defaults: Object.assign({}, Tool.prototype.defaults, {
        selectedFeatures: undefined,
        select: undefined,
        dragBox: undefined,
        renderToWindow: true
    }),
    /**
     * @class SelectFeaturesModel
     * @extends Tool
     * @memberof Tools.SelectFeatures
     * @listens Tools.SelectFeatures#RadioRequestGetSelectedFeatures
     * @listens i18next#RadioTriggerLanguageChanged
     * @constructs
     */
    initialize: function () {
        this.superInitialize();
        this.changeLanguage();

        this.listenTo(this, {
            "change:isActive": function (model, status) {
                if (status) {
                    this.createInteractions();
                }
                else {
                    this.removeInteractions();
                }
            }
        });

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLanguage
        });
    },

    /**
     * Adds the interactions to the Map.
     *
     * @param {Select} select interaction.
     * @param {DragBox} dragBox interaction.
     * @returns {void}
     */
    addInteractionsToMap: function (select, dragBox) {
        Radio.trigger("Map", "addInteraction", select);
        Radio.trigger("Map", "addInteraction", dragBox);
    },

    /**
     * Translates the parameters of this class to the given language.
     *
     * @returns {void}
     */
    changeLanguage: function () {
        // TODO: Implement me if needed
    },

    /**
     * Clears the selected features of all current instances.
     *
     * @returns {void}
     */
    clearFeatures: function () {
        this.get("selectedFeatures").clear();
    },

    /**
     * Concats the given features to the Collection of currently selected features.
     *
     * @param {Array} features to be concatenated.
     * @returns {void}
     */
    concatFeatures: function (features) {
        this.get("selectedFeatures").concat(features);
    },

    /**
     * Creates the Interactions for selecting features.
     *
     * @returns {void}
     */
    createInteractions: function () {
        // TODO: Kann man die DragBox noch verschönern?
        // TODO: Muss man select als interaction überhaupt hinzufügen?
        // TODO: Wäre ein normales Array statt der Collection eventuell einfacher?
        const select = new Select(),
            dragBox = new DragBox({
                condition: platformModifierKeyOnly
            }),
            that = this;

        this.setSelectedFeatures(select.getFeatures());

        dragBox.on("boxstart", function () {
            that.clearFeatures();
        });

        dragBox.on("boxend", function () {
            const layers = Radio.request("Map", "getLayers"),
                extent = dragBox.getGeometry().getExtent();/* ,
                rotation = Radio.request("Map", "getMap").getView().getRotation,
                oblique = rotation % (Math.PI / 2) !== 0,
                canditateFeatures = [],
                anchor = [0, 0];
            let geometry = dragBox.getGeometry().clone(),
                extent = geometry.getExtent();*/
            let gfiAttributes,
                properties,
                geometry;

            layers.forEach(layer => {
                // TODO: Do this for all VectorSources!
                if (layer.get("visible") && layer.get("typ") === "WFS") {
                    gfiAttributes = layer.get("gfiAttributes");
                    layer.get("source").forEachFeatureIntersectingExtent(extent, (feature, index) => {
                        // TODO: Vllt vorher an dieser Stelle eine Methode aufrufen, welche die Feature zu lesbaren Objekten aufbereitet --> so wie jetzt?
                        properties = Requestor.translateGFI([feature.getProperties()], gfiAttributes)[0];
                        geometry = feature.getGeometry().getExtent();

                        that.pushFeature({
                            id: index,
                            properties: properties,
                            geometry: geometry,
                            feature: feature
                        });

                        // that.pushFeature(feature);
                        // canditateFeatures.push(feature);
                    });
                }
            });

            Radio.trigger("SelectFeaturesView", "updatedSelection");

            // console.log(that.get("selectedFeatures"))

            // TODO: Muss diese Rotation überhaupt beachtet werden oder könnte man nicht eigentlich einfach alle Werte des Arrays direkt pushen?

            // If the View is not obliquely rotated the dragBox and its extent are equivalent
            // so intersecting features can be added directly to the collection
            /* if (!oblique) {
                that.concatFeatures(canditateFeatures);
            }
            // Otherwise the extent of the box will exceed its geometry.
            // That's why both the dragBox and the features are rotated around the same anchor
            // to confirm that they intersect with one another.
            else {
                geometry.rotate(-rotation, anchor);
                extent = geometry.getExtent();

                canditateFeatures.forEach(function (feature) {
                    geometry = feature.getGeometry().clone();
                    geometry.rotate(-rotation, anchor);

                    if (geometry.intersectsExtent(extent)) {
                        that.pushFeature(feature);
                    }
                });
            }*/
        });

        this.setSelectInteraction(select);
        this.setDragBoxInteraction(dragBox);

        this.addInteractionsToMap(select, dragBox);
    },

    /**
     * Pushes the given feature to the Collection of currently selected features.
     *
     * @param {*} feature to be pushed
     * @returns {void}
     */
    pushFeature: function (feature) {
        this.get("selectedFeatures").push(feature);
    },

    /**
     * Removes the Interactions from the Map.
     *
     * @returns {void}
     */
    removeInteractions: function () {
        Radio.trigger("Map", "removeInteraction", this.get("dragBox"));
        Radio.trigger("Map", "removeInteraction", this.get("select"));
    },

    /**
     * Sets the dragBox Interaction to the given parameter.
     *
     * @param {DragBox} dragBox Interaction to be set.
     * @returns {void}
     */
    setDragBoxInteraction: function (dragBox) {
        this.set("dragBox", dragBox);
    },

    /**
     * Sets the Collection of selected features to the given Parameter.
     *
     * @param {Collection} selectedFeatures The Collection of selected Features to be set.
     * @returns {void}
     */
    setSelectedFeatures: function (selectedFeatures) {
        this.set("selectedFeatures", selectedFeatures);
    },

    /**
     * Sets the select Interaction to the given parameter.
     *
     * @param {Select} select Interaction to be set.
     * @returns {void}
     */
    setSelectInteraction: function (select) {
        this.set("select", select);
    }
});

export default SelectFeaturesTool;
