import {WKT} from "ol/format.js";

/**
 * Help function for determining a feature with textual description.
 * @param {Object|String[]} content Object with the type of geometry, the geometry itself and the geometry of interior parts.
 * @param {String} [geometryType="POLYGON"] The type of geometry.
 * @returns {ol/Feature} Feature with WellKnownText-Geom.
 */
function getWKTGeom (content, geometryType = "POLYGON") {
    const format = new WKT(),
        type = content?.geometryType ? content.geometryType : geometryType, // the default value is POLYGON because for type street, there is no geometryType defined. But it should be polygon
        geometry = content?.coordinate ? content.coordinate : content,
        interiorGeometry = content?.interiorGeometry;
    let wkt,
        regExp;

    if (type === "POLYGON") {
        wkt = type + "((";
        geometry.forEach(function (element, index, list) {
            if (index % 2 === 0) {
                wkt += element + " ";
            }
            else if (index === list.length - 1) {
                wkt += element + "))";
            }
            else {
                wkt += element + ", ";
            }
        });
    }
    else if (type === "POINT") {
        wkt = type + "(";
        wkt += geometry[0] + " " + geometry[1];
        wkt += ")";
    }
    else if (type === "MULTIPOLYGON") {
        wkt = type + "(((";
        geometry.forEach(function (element, index) {
            geometry[index].forEach(function (coord, index2, list) {
                if (index2 % 2 === 0) {
                    wkt += coord + " ";
                }
                else if (index2 === list.length - 1 && interiorGeometry?.indexOf(index + 1) !== -1) {
                    wkt += coord + ")";
                }
                else if (index2 === list.length - 1) {
                    wkt += coord + "))";
                }
                else {
                    wkt += coord + ", ";
                }
            });

            if (interiorGeometry?.indexOf(index + 1) !== -1) {
                wkt += ",(";
            }
            else if (index === geometry.length - 1 && interiorGeometry?.indexOf(index + 1) === -1) {
                wkt += ")";
            }
            else {
                wkt += ",((";
            }
        });
        regExp = new RegExp(", \\)\\?\\(", "g");
        wkt = wkt.replace(regExp, "),(");
    }
    return format.readFeature(wkt);
}

export {getWKTGeom};
