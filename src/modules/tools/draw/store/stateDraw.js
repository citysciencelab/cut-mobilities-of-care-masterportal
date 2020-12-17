const symbol = {
        id: "iconPoint",
        type: "simple_point",
        value: "simple_point"
    },
    /**
     * @property {Boolean} active Current status of the Tool.
     * @property {Object} addFeatureListener Listens to the the event "addfeature" which is fired after a feature has been added to the map.
     * @property {String} currentInteraction The current interaction. Could be either "draw", "modify" or "delete"
     * @property {Object[]} deactivatedDrawInteractions Array of draw interactions which are deactivated in the process of the tool. Can be used to reactivate them from another point.
     * @property {Boolean} deactivateGFI If set to true, the activation of the tool deactivates the GFI tool.
     * @property {module:ol/interaction/Draw} drawInteraction The draw interaction of the draw tool.
     * @property {module:ol/interaction/Draw} drawInteractionTwo The second draw interaction of the draw tool needed if a double circle is to be drawn.
     * @property {Object} drawType The type of the draw interaction. The first parameter represents the type unique identifier of the draw interaction as a String and the second parameter represents the geometry of the drawType as a String.
     * @property {Number} fId ID of the last feature that was added to the redoArray.
     * @property {Boolean} freeHand Distinction between a freeHand line drawing or a static one.
     * @property {String} glyphicon Glyphicon used in the header of the window.
     * @property {Object[]} iconList List of icons used for the point draw interaction.
     * @property {String} id Internal Identifier for the Tool.
     * @property {Integer} idCounter Amount of features drawn.
     * @property {String} innerBorderColor The color of the border of the dropdown menu for the selection of the inner radius of a circle.
     * @property {Boolean} isVisibleInMenu TODO: Currently has no use. Update this comment when there is a usage.
     * @property {module:ol/layer/Vector} layer The layer in which the features are drawn.
     * @property {module:ol/interaction/Modify} modifyInteraction The modify interaction of the draw tool.
     * @property {String} outerBorderColor The color of the border of the dropdown menu for the selection of the outer radius of a circle.
     * @property {Number} pointSize The size of the point.
     * @property {Number[]} redoArray Array of the IDs of features removed through the undo button.
     * @property {Boolean} renderToWindow Decides whether the Tool should be displayed as a window or as a sidebar.
     * @property {Boolean} resizableWindow Determines whether the Tool window can be resized.
     * @property {module:ol/interaction/Select} selectInteraction The select interaction of the draw tool.
     * @property {Object} symbol The symbol for the point.
     * @property {Boolean} withoutGUI Determines whether the window for the draw tool is rendered or not.
     * @property {Number} zIndex Determines in which order features are rendered on the view.
     * @property {Object} drawSymbolSettings the values used for the drawType drawSymbol
     * @property {String[]} drawSymbolSettings.color The color of the drawn feature represented as an array.
     * @property {Number} drawSymbolSettings.opacity The opacity of the color of the drawn features. NOTE: The values of the transparencySettings are opacity values.
     * @property {Object} drawLineSettings the values used for the drawType drawLine
     * @property {Number} drawLineSettings.strokeWidth Stroke width.
     * @property {Number} drawLineSettings.opacityContour The opacity of the color of the contours for features of drawType "LineString". NOTE: The values of the transparencySettings are opacity values.
     * @property {String[]} drawLineSettings.colorContour The color of the contours of the drawn feature represented as an array.
     * @property {Object} drawCurveSettings the values used for the drawType drawCurve
     * @property {Number} drawCurveSettings.strokeWidth Stroke width.
     * @property {Number} drawCurveSettings.opacityContour The opacity of the color of the contours for features of drawType "LineString". NOTE: The values of the transparencySettings are opacity values.
     * @property {String[]} drawCurveSettings.colorContour The color of the contours of the drawn feature represented as an array.
     * @property {Object} drawAreaSettings the values used for the drawType drawArea
     * @property {Number} drawAreaSettings.strokeWidth Stroke width.
     * @property {String[]} drawAreaSettings.color The color of the drawn feature represented as an array.
     * @property {Number} drawAreaSettings.opacity The opacity of the color of the drawn features. NOTE: The values of the transparencySettings are opacity values.
     * @property {String[]} drawAreaSettings.colorContour The color of the contours of the drawn feature represented as an array.
     * @property {Number} drawAreaSettings.opacityContour The opacity of the color of the contours for features of drawType "LineString". NOTE: The values of the transparencySettings are opacity values.
     * @property {Object} drawCircleSettings the values used for the drawType drawCircle
     * @property {String} drawCircleSettings.circleMethod The method for drawing features of drawType "Circle".
     * @property {String} drawCircleSettings.unit The unit of measurement (e.g. "km").
     * @property {Number} drawCircleSettings.circleInnerDiameter The inner diameter for feature of drawType "Circle".
     * @property {Number} drawCircleSettings.strokeWidth Stroke width.
     * @property {String[]} drawCircleSettings.color The color of the drawn feature represented as an array.
     * @property {Number} drawCircleSettings.opacity The opacity of the color of the drawn features. NOTE: The values of the transparencySettings are opacity values.
     * @property {String[]} drawCircleSettings.colorContour The color of the contours of the drawn feature represented as an array.
     * @property {Number} drawCircleSettings.opacityContour The opacity of the color of the contours for features of drawType "LineString". NOTE: The values of the transparencySettings are opacity values.
     * @property {Object} drawDoubleCircleSettings the values used for the drawType drawDoubleCircle
     * @property {String} drawDoubleCircleSettings.circleMethod The method for drawing features of drawType "DoubleCircle".
     * @property {String} drawDoubleCircleSettings.unit The unit of measurement (e.g. "km").
     * @property {Number} drawDoubleCircleSettings.circleInnerDiameter The inner diameter for feature of drawType "DoubleCircle".
     * @property {Number} drawDoubleCircleSettings.circleOuterDiameter The outer diameter for feature of drawType "DoubleCircle".
     * @property {Number} drawDoubleCircleSettings.strokeWidth Stroke width.
     * @property {String[]} drawDoubleCircleSettings.color The color of the drawn feature represented as an array.
     * @property {Number} drawDoubleCircleSettings.opacity The opacity of the color of the drawn features. NOTE: The values of the transparencySettings are opacity values.
     * @property {String[]} drawDoubleCircleSettings.colorContour The color of the contours of the drawn feature represented as an array.
     * @property {Number} drawDoubleCircleSettings.opacityContour The opacity of the color of the contours for features of drawType "LineString". NOTE: The values of the transparencySettings are opacity values.
     * @property {Object} writeTextSettings the values used for the drawType writeText
     * @property {String} writeTextSettings.text The text to be written if the drawType "writeText" is chosen.
     * @property {Number} writeTextSettings.fontSize The size of the font used for the text interaction.
     * @property {String} writeTextSettings.font The font used for the text interaction.
     * @property {String[]} writeTextSettings.color The color of the drawn feature represented as an array.
     * @property {Number} writeTextSettings.opacity The opacity of the color of the drawn features. NOTE: The values of the transparencySettings are opacity values.
     */
    state = {
        active: false,
        addFeatureListener: {},
        currentInteraction: "draw",
        deactivatedDrawInteractions: [],
        deactivateGFI: true,
        drawInteraction: null,
        drawInteractionTwo: null,
        drawType: {
            id: "drawSymbol",
            geometry: "Point"
        },
        fId: 0,
        freeHand: false,
        glyphicon: "glyphicon-pencil",
        iconList: [
            symbol,
            {
                "id": "gelber Pin",
                "type": "image",
                "scale": 0.5,
                "value": "https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"
            }
        ],
        id: "draw",
        idCounter: 0,
        innerBorderColor: "",
        isVisibleInMenu: true,
        layer: null,
        modifyInteraction: null,
        outerBorderColor: "",
        pointSize: 16,
        redoArray: [],
        renderToWindow: true,
        resizableWindow: true,
        selectInteraction: null,
        selectInteractionModify: null,
        selectedFeature: null,
        symbol,
        withoutGUI: false,
        zIndex: 0,
        name: "Zeichnen / Schreiben",
        imgPath: "",

        drawSymbolSettings: {
            color: [55, 126, 184, 1],
            opacity: 1
        },
        drawLineSettings: {
            strokeWidth: 1,
            opacityContour: 1,
            colorContour: [0, 0, 0, 1]
        },
        drawCurveSettings: {
            strokeWidth: 1,
            opacityContour: 1,
            colorContour: [0, 0, 0, 1]
        },
        drawAreaSettings: {
            strokeWidth: 1,
            color: [55, 126, 184, 1],
            opacity: 1,
            colorContour: [0, 0, 0, 1],
            opacityContour: 1
        },
        drawCircleSettings: {
            circleMethod: "interactive",
            unit: "m",
            circleInnerDiameter: 0,
            strokeWidth: 1,
            color: [55, 126, 184, 1],
            opacity: 1,
            colorContour: [0, 0, 0, 1],
            opacityContour: 1
        },
        drawDoubleCircleSettings: {
            circleMethod: "defined",
            unit: "m",
            circleInnerDiameter: 0,
            circleOuterDiameter: 0,
            strokeWidth: 1,
            color: [55, 126, 184, 1],
            opacity: 1,
            colorContour: [0, 0, 0, 1],
            outerColorContour: [0, 0, 0, 1],
            opacityContour: 1
        },
        writeTextSettings: {
            text: "",
            fontSize: 10,
            font: "Arial",
            color: [55, 126, 184, 1],
            opacity: 1
        }
    };

export default state;
