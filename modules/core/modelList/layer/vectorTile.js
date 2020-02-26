import Layer from "./model";
import MVT from "ol/format/MVT";
import OpenLayersVectorTileLayer from "ol/layer/VectorTile";
import OpenLayersVectorTileSource from "ol/source/VectorTile";
import {applyStyle} from "ol-mapbox-style";

const VectorTileLayer = Layer.extend(/** @lends WFSLayer.prototype */{

    defaults: _.extend({}, Layer.prototype.defaults, {
        selectedStyleID: undefined
    }),

    /**
     * @class VectorTileLayer
     * @extends Layer
     * @memberof Core.ModelList.Layer
     * @constructs
     * @property {String[]} supported=["2D", "3D"] Supported map modes.
     * @property {Boolean} showSettings=true Flag if settings selectable.
     * @property {Boolean} isClustered=false Flag if layer is clustered.
     * @property {String[]} allowedVersions=["1.1.0"] Allowed Version of WFS requests.
     * @fires Layer#RadioTriggerVectorLayerResetFeatures
     * @listens Layer#RadioRequestVectorLayerGetFeatures
     */
    initialize: function () {

        // TODO: Check projection, echo error if mismatch
        // var projection = Radio.request("MapView", "getProjection");
        // console.log("map projection is", projection.getCode());

        /*
        this.checkForScale(Radio.request("MapView", "getOptions"));

        if (!this.get("isChildLayer")) {
            Layer.prototype.initialize.apply(this);
        }

        if (this.has("clusterDistance")) {
            this.set("isClustered", true);
        }
        */

/*
        Radio.trigger("Map", "addLayer", new TileLayer({
            source: new OSM()
        }));
*/

        this.createLayer();
    },

    /**
     * Creates vector tile layer.
     * @return {void}
     */
    createLayer: function () {


        // TODO: Use proxy

        var vectorTileLayer = new OpenLayersVectorTileLayer({
                source: new OpenLayersVectorTileSource({
                    format: new MVT(),
                    url: this.get("url")
                }),
                id: this.get("id"),
                typ: this.get("typ"),
                name: this.get("name"),
                visible: false
            }),
            defaultStyle;

        this.setLayer(vectorTileLayer);

        // TODO: Set visible if set to be visible by config)

        /*
        map.on("pointermove", function (evt) {
            map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                console.log("got", feature);
            });
        });
        */

        defaultStyle = this.get("vtStyles").find(function (item) {
            return item.defaultStyle
        });

        this.set("selectedStyleID", defaultStyle.id);

        // TODO: Handle undefined

        console.log("default Style is ", defaultStyle.name);

        // vectorTileLayer.setVisible(this.get("isSelected"));
        // TODO: Display without style?
        this.setStyle(defaultStyle.id).then(() => {
            this.setVisible(this.get("isSelected"));
        });
    },

    setStyle: function (styleID) {
        const style = this.get("vtStyles").find(function (item) {
            return item.id === styleID;
        });

        return fetch(style.url).then(response => {
            return response.json();
        }).then(mapboxStyle => {
            // TODO: generic layer name
            applyStyle(this.get("layer"), mapboxStyle, this.get("source"));
            this.set("selectedStyleID", styleID);
        });
    }
});

export default VectorTileLayer;
