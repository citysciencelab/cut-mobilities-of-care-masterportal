import {KML} from "ol/format.js";
import {colorOptions} from "../constantsDraw";

/**
 * Adds a unique styleId to each ExtendedData Element of the converted Features.
 * NOTE: The features can not be printed, if no unique id is present.
 *
 * @param {Document} convertedFeatures The features converted to KML.
 * @returns {void}
 */
function addUniqueStyleId (convertedFeatures) {
    convertedFeatures.getElementsByTagName("ExtendedData").forEach(extendedData => {
        extendedData.getElementsByTagName("value")[0].textContent = Radio.request("Util", "uniqueId", "");
    });
}

/**
 * Checks whether bots arrays are of length 3 and whether their values are equal at the same positions.
 * Used to check if two colors are the same.
 *
 * @param {number[]} arrOne First array.
 * @param {number[]} arrTwo Second array.
 * @returns {boolean} true, if both are arrays of length 3 consisting of the same values; false, else.
 */
function allCompareEqual (arrOne, arrTwo) {
    return Array.isArray(arrOne)
        && arrOne.length === 3
        && Array.isArray(arrTwo)
        && arrTwo.length === 3
        && arrOne.every((val, index) => val === arrTwo[index]);
}

/**
 * Creates the IconStyle-Part of a Point-KML. Contains the link to a SVG.
 *
 * @see https://developers.google.com/kml/documentation/kmlreference#iconstyle
 * @param {string} url URL from where the Icon can be retrieved from.
 * @param {number} scale Scale of the Icon. NOTE: If this value is 0, the Icon is not displayed.
 * @returns {string} The IconStyle-Part of a KML-File.
 */
function createKmlIconStyle (url, scale) {
    const scaleTag = `<scale>${scale}</scale>`,
        href = `<href>${url}</href>`;

    return `<IconStyle>${scaleTag}<Icon>${href}</Icon></IconStyle>`;
}

/**
 * If the given color is included in the color options of the Draw Tool the name of the color is returned.
 *
 * @param {number[]} color The color of which the name is to be retrieved.
 * @returns {string} The name of the color corresponding to the number array.
 */
function getIconColor (color) {
    const selectedOption = colorOptions.filter(option => allCompareEqual(color, option.value));

    if (selectedOption && selectedOption[0]) {
        return selectedOption[0].color;
    }
    return "";
}

/**
 * Constructs the hotspot-tag (anchoring of the icon) of an IconStyle-Part of a Point-KML.
 *
 * @see https://developers.google.com/kml/documentation/kmlreference#hotspot
 * @param {Object} anchor Values for the hotspot-tag are retrieved from this object.
 * @returns {string} hotspot-Tag for a KML IconStyle.
 */
function getKmlHotSpotOfIconStyle (anchor) {
    const x = anchor.anchor[0],
        y = anchor.anchor[1],
        {xUnit, yUnit} = anchor;

    return `<hotSpot x="${x}" y="${y}" xunits="${xUnit}" yunits="${yUnit}" />`;
}

/**
 * Converts the features to KML while also saving its style information.
 *
 * @param {Object} context actions context object.
 * @returns {string} The features written in KML as a String.
*/
export default async function convertFeaturesToKml ({state, dispatch}) {
    const features = state.download.features,
        featureCount = features.length,
        anchors = Array(featureCount).fill(undefined),
        format = new KML({extractStyles: true}),
        hasIconUrl = Array(featureCount).fill(false),
        pointColors = Array(featureCount).fill(undefined),
        skip = Array(featureCount).fill(false),
        textFonts = Array(featureCount).fill(undefined),
        convertedFeatures = new DOMParser().parseFromString(await dispatch("convertFeatures", format), "text/xml");

    features.forEach((feature, i) => {
        const type = feature.getGeometry().getType();
        let color,
            style,
            styles;

        if (type === "Point" && feature.values_.name !== undefined) {
            // Imported KML with text, can be used as it is
            skip[i] = true;
        }
        else {
            try {
                styles = feature.getStyleFunction()(feature);
                style = Array.isArray(styles) ? styles[0] : styles;
            }
            catch (err) {
                // Only happens if an imported KML is exported, can be skipped
                skip[i] = true;
            }

            if (type === "Point") {
                if (style.getImage() !== null && style.getImage().iconImage_ !== undefined) {
                    // Imported KML with link to SVG icon, has iconUrl from previous import
                    hasIconUrl[i] = true;
                    const anchorXUnits = style.getImage().anchorXUnits_,
                        anchorYUnits = style.getImage().anchorYUnits_,
                        anchor = style.getImage().anchor_;

                    anchors[i] = {xUnit: anchorXUnits, yUnit: anchorYUnits, anchor: anchor};
                }
                else if (style.getText()) {
                    textFonts[i] = style.getText().getFont();
                }
                else {
                    color = style.getImage().getFill().getColor();
                    pointColors[i] = [color[0], color[1], color[2]];
                }
            }
        }
    });

    addUniqueStyleId(convertedFeatures);

    convertedFeatures.getElementsByTagName("Placemark").forEach((placemark, i) => {
        if (placemark.getElementsByTagName("Point").length > 0 && skip[i] === false) {
            const style = placemark.getElementsByTagName("Style")[0];

            if (hasIconUrl[i] === false && pointColors[i]) {
                // Please be aware of devtools/tasks/replace.js and devtools/tasks/customBuildPortalconfigsReplace.js if you change the path of the SVG
                const iconUrl = `${window.location.origin}/img/tools/draw/circle_${getIconColor(pointColors[i])}.svg`,
                    iconStyle = createKmlIconStyle(iconUrl, 1);

                style.innerHTML += iconStyle;
            }
            else if (hasIconUrl[i] === true && anchors[i] !== undefined) {
                const iconStyle = placemark.getElementsByTagName("IconStyle")[0];

                iconStyle.innerHTML += getKmlHotSpotOfIconStyle(anchors[i]);
            }
        }

    });
    return new XMLSerializer().serializeToString(convertedFeatures);
}
