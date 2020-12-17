import {KML} from "ol/format.js";
import {pointColorOptions} from "../../../draw/store/constantsDraw";

function addUniqueStyleId (convertedFeatures) {
    convertedFeatures.getElementsByTagName("ExtendedData").forEach((extendedData) => {
        extendedData.getElementsByTagName("value")[0].textContent = Radio.request("Util", "uniqueId", "");
    });
}

function allCompareEqual (array1, array2) {
    // TODO: Shouldnt it be nested differently ? --> should the AND operator be in brackets?
    if (!Array.isArray(array1) || Array.isArray(array1) && array1.length < 3 || !Array.isArray(array2) || Array.isArray(array2) && array2.length < 3) {
        return false;
    }
    return array1[0] === array2[0] && array1[1] === array2[1] && array1[2] === array2[2];
}

function createKmlIconStyle (url, scale) {
    const scaleTag = `<scale>${scale}</scale>`,
        href = `<href>${url}</href>`;

    return `<IconStyle>${scaleTag}<Icon>${href}</Icon></IconStyle>`;
}

function getIconColor (color) {
    const colOption = pointColorOptions.filter(option => allCompareEqual(color, option.value));

    if (colOption && colOption[0]) {
        return colOption[0].color;
    }
    return "";
}

function getKmlHotSpotOfIconStyle (anchor) {
    const x = anchor.anchor[0],
        y = anchor.anchor[1],
        {xUnit, yUnit} = anchor;

    return `<hotSpot x="${x}" y="${y}" xunits="${xUnit}" yunits="${yUnit}" />`;
}

function getKmlScaleOfLableStyle (scale) {
    return `<colorMode>normal</colorMode>${scale}<scale></scale>`;
}

function getScaleFromFontSize (fontSize) {
    const size = parseInt(fontSize.substr(0, 2), 10);

    if (size <= 12) {
        return 0;
    }
    else if (size <= 20) {
        return 1;
    }
    else if (size <= 32) {
        return 2;
    }
    return 1;
}

export default function convertFeaturesToKml ({state, dispatch}) {
    const {features} = state,
        anchors = [],
        featureCount = features.length,
        format = new KML({extractStyles: true}),
        hasIconUrl = [],
        pointColors = [],
        pointOpacities = [],
        skip = [],
        textFonts = [];
    let convertedFeatures = [];

    // TODO: Would something weird happen if this was not included?
    pointOpacities.fill(undefined, 0, featureCount);
    pointColors.fill(undefined, 0, featureCount);
    hasIconUrl.fill(false, 0, featureCount);
    anchors.fill(undefined, 0, featureCount);
    textFonts.fill(undefined, 0, featureCount);
    skip.fill(false, 0, featureCount);

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
                styles = feature.getStyleFunction().call(feature);
                style = styles[0];
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
                else if (feature.getStyle().getText()) {
                    textFonts[i] = feature.getStyle().getText().getFont();
                }
                else {
                    color = style.getImage().getFill().getColor();
                    pointOpacities[i] = style.getImage().getFill().getColor()[3];
                    pointColors[i] = [color[0], color[1], color[2]];
                }
            }
        }
    });

    convertedFeatures = new DOMParser().parseFromString(dispatch("convertFeatures", format), "text/xml");
    addUniqueStyleId(convertedFeatures);

    convertedFeatures.getElementsByTagName("Placemark").forEach((placemark, i) => {
        if (placemark.getElementsByTagName("Point").length > 0 && skip[i] === false) {
            const style = placemark.getElementsByTagName("Style")[0];

            if (placemark.getElementsByTagName("name")[0]) {
                const labelStyle = placemark.getElementsByTagName("LabelStyle")[0],
                    // Please be aware of devtools/tasks/replace.js and devtools/tasks/customBuildPortalconfigsReplace.js if you change the path of the SVG
                    iconUrl = `${window.location.origin}/img/tools/draw/circle_blue.svg`;

                if (textFonts[i]) {
                    labelStyle.innerHTML += getKmlScaleOfLableStyle(getScaleFromFontSize(textFonts[i]));
                }
                style.innerHTML += createKmlIconStyle(iconUrl, 0);
            }
            else if (hasIconUrl[i] === false && pointColors[i]) {
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
