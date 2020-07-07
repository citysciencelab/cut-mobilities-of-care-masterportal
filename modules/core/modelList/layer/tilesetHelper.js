let default3DTileStyleValues = {};

/**
 * @type {ol.Color}
 */
const whiteColor = [255, 255, 255, 1],
    /**
     * @type {ol.Color}
     */
    blackColor = [0, 0, 0, 1],
    /**
     * @type {Object}
     */
    defaultVectorStyleItemOptions = {
        image: {
            fill: {
                color: [255, 255, 255, 0.4]
            },
            stroke: {
                color: blackColor,
                width: 1
            },
            radius: 5
        },
        stroke: {
            color: [51, 153, 204, 1],
            width: 1.25
        },
        fill: {
            color: [255, 255, 255, 0.4]
        },
        text: {
            font: "bold 18px sans-serif",
            textBaseline: "bottom",
            offsetY: -15,
            offsetX: 0
        }
    },
    /**
     * @enum {number}
     * @property {number} POLYGON
     * @property {number} POLYLINE
     * @property {number} POINT
     */
    olcsGeometryType = {
        POLYGON: 1,
        POLYLINE: 2,
        POINT: 3
    };

/**
 * Converts HEX colors to RGB
 * @param {string} h -
 * @param {number=} opacity -
 * @return {ol.Color} -
 * @memberof Core.ModelList.Layer.Tileset
 * @export
 */
export function hexToOlColor (h, opacity) {
    let hex = h.substring(1);

    if (hex.length === 3) {
        hex = hex.replace(/([\w\d])/g, "$1$1");
    }

    return [
        parseInt(hex.substring(0, 2), 16),
        parseInt(hex.substring(2, 4), 16),
        parseInt(hex.substring(4, 6), 16),
        opacity === null || opacity === undefined ? 1.0 : opacity
    ];
}

/**
 * parse Color method
 * @param {ol.Color|ol.ColorLike|Array<number>} color -
 * @returns {ol.Color} -
 * @memberof Core.ModelList.Layer.Tileset
 */
export function parseColor (color) {
    if (Array.isArray(color)) {
        if (color.length === 3) {
            color.push(1.0);
        }
        return color;
    }

    if (typeof color === "string") {
        if ((/^#/).test(color)) {
            return hexToOlColor(color);
        }
        if ((/^rgba?\((\d+(,\s?)?){3}((0|1)(\.\d+)?)?\)/).test(color)) {
            const output = color
                .replace(/^rgba?\(([\s\S]+?)\)/, "$1")
                .replace(/\s/, "")
                .split(",")
                .map(n => Number(n));

            if (output.length === 3) {
                output.push(1.0);
            }
            return output;
        }
    }

    throw new Error(`Cannot parse color ${color}`);
}

/**
 * returns a color string in the form rgba(255,255,255,0)
 * @param {ol.Color|Array<number>|ol.ColorLike} color -
 * @return {string} -
 * @memberof Core.ModelList.Layer.Tileset
 * @export
 */
export function getStringColor (color) {
    return `rgba(${parseColor(color).join(",")})`;
}

/**
 * default Values @see https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/3d-tiles-next/Styling
 * @type {Object<string,string>}
 */
default3DTileStyleValues = {
    olcs_color: getStringColor(whiteColor),
    olcs_scale: "1.0",
    olcs_outlineWidth: "0.0",
    olcs_outlineColor: getStringColor(blackColor),
    olcs_pointSize: "8.0",
    olcs_image: undefined,
    olcs_font: "'bold 18px sans-serif'",
    olcs_fontColor: getStringColor(blackColor),
    olcs_fontOutlineWidth: "1.0",
    olcs_fontOutlineColor: getStringColor(whiteColor),
    olcs_labelText: undefined,
    olcs_anchorLineColor: getStringColor(whiteColor)
};


/**
 * returns the cesium3DTilesetStyle Condition with the value as the given Attribute
 * The condition checks for undefined and null
 * @param {string} attribute -
 * @param {boolean=} isColor -
 * @return {Array<Array<string>>} -
 * @memberof Core.ModelList.Layer.Tileset
 */
export function getDefaultCondition (attribute, isColor) {
    const condition = `Boolean(\${${attribute}})===true`,
        value = isColor ? `color(\${${attribute}})` : `\${${attribute}}`;

    return [
        [condition, value],
        ["true", default3DTileStyleValues[attribute]]
    ];
}

/**
 * sets the color condition for the Cesium3DTileStyle
 * @see https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileStyle.html
 * @param {Object} vcsStyle vcs Styling Object
 * @param {Cesium.Cesium3DTileStyle} style Cesium Style Instance
 * @memberof Core.ModelList.Layer.Tileset
 * @returns {void} -
 */
export function setCesiumStyleColor (vcsStyle, style) {
    const colorConditions = getDefaultCondition("olcs_color", true);
    let strokeColor = defaultVectorStyleItemOptions.stroke.color,
        imageFillColor = defaultVectorStyleItemOptions.image.fill.color,
        fillColor = defaultVectorStyleItemOptions.fill.color;

    if (vcsStyle && vcsStyle.stroke && vcsStyle.stroke.color) {
        strokeColor = vcsStyle.stroke.color;
    }
    colorConditions.splice(1, 0, [`\${olcs_geometryType}===${olcsGeometryType.POLYLINE}`, getStringColor(strokeColor)]);

    if (vcsStyle && vcsStyle.image && vcsStyle.image.fill && vcsStyle.image.fill.color) {
        imageFillColor = vcsStyle.image.fill.color;
    }
    colorConditions.splice(1, 0, [`\${olcs_geometryType}===${olcsGeometryType.POINT}`, getStringColor(imageFillColor)]);

    if (vcsStyle && vcsStyle.fill && vcsStyle.fill.color) {
        fillColor = vcsStyle.fill.color;
    }
    colorConditions.splice(-1, 1, ["true", getStringColor(fillColor)]);

    style.color = {
        conditions: colorConditions
    };
}

/**
 * sets the scale, pointOutlineWidth, pointOutlineColor, pointSize, image, verticalOrigin, horizontalOrigin conditions for the Cesium3DTileStyle
 * @see https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileStyle.html
 * @param {Object} vcsStyle vcs Styling Object
 * @param {Cesium.Cesium3DTileStyle} style Cesium Style Instance
 * @memberof Core.ModelList.Layer.Tileset
 * @returns {void} -
 */
export function setCesiumStyleImage (vcsStyle, style) {
    const scaleConditions = getDefaultCondition("olcs_scale"),
        pointOutlineWidthConditions = getDefaultCondition("olcs_outlineWidth"),
        pointOutlineColorConditions = getDefaultCondition("olcs_outlineColor", true),
        pointSizeConditions = getDefaultCondition("olcs_pointSize"),
        imageConditions = getDefaultCondition("olcs_image");

    let pointSize = defaultVectorStyleItemOptions.image.radius,
        outlineStrokeWidth = defaultVectorStyleItemOptions.image.stroke.width;


    if (vcsStyle.image && vcsStyle.image.scale) {
        scaleConditions.splice(1, 1, ["true", vcsStyle.image.scale]);
    }

    if (vcsStyle.image && vcsStyle.image.src) {
        imageConditions.splice(1, 1, ["true", `'${vcsStyle.image.src}'`]);
    }
    else {
        if (vcsStyle.image && vcsStyle.image.radius) {
            pointSize = vcsStyle.image.radius;
        }
        pointSize *= 2;
        if (vcsStyle.image && vcsStyle.image.stroke) {
            if (typeof vcsStyle.image.stroke.width === "number") {
                outlineStrokeWidth = vcsStyle.image.stroke.width;
            }
            if (vcsStyle.image.stroke.color) {
                pointOutlineColorConditions.splice(1, 1, ["true", getStringColor(vcsStyle.image.stroke.color)]);
            }
        }
        pointSize -= outlineStrokeWidth;
        pointOutlineWidthConditions.splice(1, 1, ["true", `${outlineStrokeWidth}`]);
        pointSizeConditions.splice(1, 1, ["true", `${pointSize}`]);
    }
    style.scale = {conditions: scaleConditions};
    style.pointOutlineWidth = {conditions: pointOutlineWidthConditions};
    style.pointOutlineColor = {conditions: pointOutlineColorConditions};
    style.pointSize = {conditions: pointSizeConditions};
    style.image = {conditions: imageConditions};
    style.verticalOrigin = "1";
    style.horizontalOrigin = "0";
}

/**
 * sets font conditions for the Cesium3DTileStyle
 * @see https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileStyle.html
 * @param {Object} vcsStyle vcs Styling Object
 * @param {Cesium.Cesium3DTileStyle} style Cesium Style Instance
 * @memberof Core.ModelList.Layer.Tileset
 * @returns {void} -
 */
export function setCesiumStyleText (vcsStyle, style) {
    const fontConditions = getDefaultCondition("olcs_font"),
        labelTextConditions = getDefaultCondition("olcs_labelText"),
        labelColorConditions = getDefaultCondition("olcs_fontColor", true),
        labelOutlineWidthConditions = getDefaultCondition("olcs_fontOutlineWidth"),
        labelOutlineColorConditions = getDefaultCondition("olcs_fontOutlineColor", true);

    if (vcsStyle.text) {
        if (vcsStyle.text.font) {
            fontConditions.splice(1, 1, ["true", `'${vcsStyle.text.font}'`]);
        }
        if (vcsStyle.text.label) {
            labelTextConditions.splice(1, 1, ["true", `'${vcsStyle.text.label}'`]);
        }
        if (vcsStyle.text.fill && vcsStyle.text.fill.color) {
            labelColorConditions.splice(1, 1, ["true", getStringColor(vcsStyle.text.fill.color)]);
        }
        if (vcsStyle.text.stroke && vcsStyle.text.stroke.color) {
            labelOutlineColorConditions.splice(1, 1, ["true", getStringColor(vcsStyle.text.stroke.color)]);
        }
        if (vcsStyle.text.stroke && vcsStyle.text.stroke.width !== null) {
            labelOutlineWidthConditions.splice(1, 1, ["true", `${vcsStyle.text.stroke.width || 1.25}`]);
        }
    }

    style.font = {conditions: fontConditions};
    style.labelText = {conditions: labelTextConditions};
    style.labelColor = {conditions: labelColorConditions};
    style.labelOutlineWidth = {conditions: labelOutlineWidthConditions};
    style.labelOutlineColor = {conditions: labelOutlineColorConditions};
    style.labelStyle = "Boolean(${olcs_fontOutlineWidth}) === true ? 2 : 0";
    style.labelHorizontalOrigin = "0";
    style.labelVerticalOrigin = "1";
}

/**
 * returns a cesium3DTilesetStyle with the conditions based on the vcs StyleItem Definition
 * is used for vector 3D Tiles Datasets.
 * @param {Object} vcsStyle -
 * @return {Cesium.cesium3DTilesetStyle} -
 * @memberof Core.ModelList.Layer.Tileset
 */
export function getTilesetStyle (vcsStyle) {
    const style = new Cesium.Cesium3DTileStyle({show: true});

    setCesiumStyleColor(vcsStyle, style);
    setCesiumStyleImage(vcsStyle, style);
    setCesiumStyleText(vcsStyle, style);
    return style;
}

