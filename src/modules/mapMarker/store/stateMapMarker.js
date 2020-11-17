import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Style} from "ol/style.js";

export default {
    resultToMark: [],
    pointStyleId: "",
    zoomLevel: 10,
    markerPolygon: new VectorLayer({
        name: "markerPolygon",
        source: new VectorSource(),
        alwaysOnTop: true,
        visible: false,
        style: new Style()
    }),
    markerPoint: new VectorLayer({
        name: "markerPoint",
        source: new VectorSource(),
        alwaysOnTop: true,
        visible: false,
        style: new Style()
    }),
    pinStyle: {
        color: "#E10019",
        fontSize: "38px",
        height: "auto",
        width: "auto"
    },
    polygonStyle: {
        fillColorPolygon: [8, 119, 95, 0.3],
        strokeStylePolygon: {
            color: "#08775f",
            lineDash: [8],
            width: 4
        }
    }
};
