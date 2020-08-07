/**
 * @property {Boolean} active Current status of the Tool.
 * @property {Object} addFeatureListener Listens to the the event "addfeature" which is fired after a feature has been added to the map.
 * @property {Number} circleInnerDiameter The inner diameter for feature of drawType "Circle".
 * @property {String} circleMethod The method for drawing features of drawType "Circle".
 * @property {Number} circleOuterDiameter The outer diameter for feature of drawType "Circle".
 * @property {String} currentInteraction The current interaction. Could be either "draw", "modify" or "delete"
 * @property {Array} color The color of the drawn feature represented as an array.
 * @property {Array} colorContour The color of the contours of the drawn feature represented as an array.
 * @property {Array} deactivatedDrawInteractions Array of draw interactions which are deactivated in the process of the tool. Can be used to reactivate them from another point.
 * @property {Boolean} deactivateGFI If set to true, the activation of the tool deactivates the GFI tool.
 * @property {module:ol/interaction/Draw} drawInteraction The draw interaction of the draw tool.
 * @property {module:ol/interaction/Draw} drawInteractionTwo The second draw interaction of the draw tool needed if a double circle is to be drawn.
 * @property {Object} drawType The type of the draw interaction. The first parameter represents the type unique identifier of the draw interaction as a String and the second parameter represents the geometry of the drawType as a String.
 * @property {Number} fId ID of the last feature that was added to the redoArray.
 * @property {String} font The font used for the text interaction.
 * @property {Number} fontSize The size of the font used for the text interaction.
 * @property {Boolean} freeHand Distinction between a freeHand line drawing or a static one.
 * @property {String} id Internal Identifier for the Tool.
 * @property {Integer} idCounter Amount of features drawn.
 * @property {String} innerBorderColor The color of the border of the dropdown menu for the selection of the inner radius of a circle.
 * @property {module:ol/layer/Vector} layer The layer in which the features are drawn.
 * @property {module:ol/interaction/Modify} modifyInteraction The modify interaction of the draw tool.
 * @property {Number} opacity The opacity of the color of the drawn features. NOTE: The values of the transparencyOptions are opacity values.
 * @property {Number} opacityContour The opacity of the color of the contours for features of drawType "LineString". NOTE: The values of the transparencyOptions are opacity values.
 * @property {String} outerBorderColor The color of the border of the dropdown menu for the selection of the outer radius of a circle.
 * @property {Number} pointSize The size of the point.
 * @property {Number[]} redoArray Array of the IDs of features removed through the undo button.
 * @property {Boolean} renderToWindow Decides whether the Tool should be displayed.
 * @property {module:ol/interaction/Select} selectInteraction The select interaction of the draw tool.
 * @property {Number} strokeWidth Stroke width.
 * @property {Object} symbol The symbol for the point.
 * @property {String} text The text to be written if the drawType "writeText" is chosen.
 * @property {String} unit The unit of measurement (e.g. "km").
 * @property {Number} zIndex Determines in which order features are rendered on the view.
 */
const state = {
    active: false,
    addFeatureListener: {},
    circleInnerDiameter: null,
    circleMethod: "interactive",
    circleOuterDiameter: null,
    currentInteraction: "draw",
    color: [55, 126, 184, 1],
    colorContour: [0, 0, 0, 1],
    deactivatedDrawInteractions: [],
    deactivateGFI: true,
    drawInteraction: null,
    drawInteractionTwo: null,
    drawType: {
        id: "drawPoint",
        geometry: "Point"
    },
    fId: 0,
    font: "Arial",
    fontSize: 10,
    freeHand: false,
    id: "draw",
    idCounter: 0,
    innerBorderColor: "",
    layer: null,
    modifyInteraction: null,
    opacity: 1,
    opacityContour: 1,
    outerBorderColor: "",
    pointSize: 6,
    redoArray: [],
    renderToWindow: true,
    selectInteraction: null,
    strokeWidth: 1,
    symbol: {
        id: "iconPoint",
        type: "simple_point",
        value: "simple_point"
    },
    text: "Klicken Sie auf die Karte um den Text zu platzieren",
    unit: null,
    zIndex: 0
};

export default state;
