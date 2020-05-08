/**
 * @property {Boolean} active Current status of the Tool.
 * @property {Object} addFeatureListener TODO: What is this for?
 * @property {Number} circleInnerRadius The inner radius for feature of drawType "Circle".
 * @property {Number} circleOuterRadius The outer radius for feature of drawType "Circle".
 * @property {Array} color The color of the drawn feature represented as an array.
 * @property {Array} colorContour The color of the contours of the drawn feature represented as an array.
 * @property {ol/interaction/Draw} drawInteractionOne The draw interaction of the draw tool.
 * @property {ol/interaction/Draw} drawInteractionTwo The second draw interaction of the draw tool. TODO: WHEN IS THIS NEEDED?
 * @property {Object} drawType The type of the draw interaction. The first parameter represents the type of the geometry as a String and the second parameter represents the displayed text in the dropdown menu as a String.
 * @property {String} font The font used for the text interaction.
 * @property {Number} fontSize The size of the font used for the text interaction.
 * @property {String} id Internal Identifier for the Tool.
 * @property {String} idCounter TODO: What is this for? Is it really a String?
 * @property {ol/layer/Vector} layer The layer in which the features are drawn.
 * @property {String} methodCircle The method for drawing features of drawType "Circle".
 * @property {ol/interaction/Modify} modifyInteraction The modify interaction of the draw tool.
 * @property {Number} opacity The opacity of the color of the drawn features.
 * @property {Number} opacityContour The opacity of the color of the contours for features of drawType "Line".
 * @property {Number} radius The radius of the feature.
 * @property {Boolean} renderToWindow Decides whether the Tool should be displayed.
 * @property {ol/interaction/Select} selectInteraction The select interaction of the draw tool.
 * @property {Number} strokeWidth TODO: What is this?
 * @property {String} text The text to be written if the drawType "Text" is chosen.
 * @property {String} unit The unit of measurement (e.g. "km").
 * @property {Number} zIndex TODO: What is this?
 */
const state = {
    active: false,
    addFeatureListener: {},
    circleInnerRadius: null, // TODO: The value needs to be adjusted to the correct units and then the float needs to be parsed
    circleOuterRadius: null, // TODO: The value needs to be adjusted to the correct units and then the float needs to be parsed
    color: [55, 126, 184, 1], // TODO: There is a check for null values in the current setter --> Still needed or can be avoided?
    colorContour: [0, 0, 0, 1],
    deactivateGFI: true, // --> Needed as in modelList/list.js it decides whether to deactivate the GFI (there should be a better way!)
    drawInteractionOne: null,
    drawInteractionTwo: null,
    drawType: { // TODO: Besides the translation of the text, a bigger setter method is needed
        geometry: "Point",
        text: "Punkt zeichnen" // --> translate?
    },
    font: "Arial",
    fontSize: 10,
    id: "draw", // --> TODO: Is it needed in the state or could it be moved to the constants?
    idCounter: null,
    layer: null, // TODO: Init on Tool start
    methodCircle: "interactive",
    modifyInteraction: null,
    opacity: 1, // TODO: Should need a new setter method as it directly corresponds with the color of the feature
    opacityContour: 1,
    radius: 6, // TODO: Is it needed to parse the input to an integer or can this simply be handled somewhere else?
    renderToWindow: true,
    selectInteraction: null,
    strokeWidth: 1, // TODO: Is it needed to parse the input to an integer or can this simply be handled somewhere else?
    text: "Klicken Sie auf die Karte um den Text zu platzieren", // --> translate?
    unit: null,
    zIndex: 0 // countUp (+1) needed
};

export default state;
