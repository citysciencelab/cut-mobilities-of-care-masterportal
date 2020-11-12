import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Style} from "ol/style.js";

export default {
    resultToMark: [],
    zoomLevel: 10,
    wkt: {},
    markerPolygon: new VectorLayer({
        name: "mapMarker",
        source: new VectorSource(),
        alwaysOnTop: true,
        visible: false,
        style: new Style({})
    })
};
