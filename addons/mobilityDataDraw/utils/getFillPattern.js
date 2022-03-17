import {DEVICE_PIXEL_RATIO} from "ol/has";

/**
 * Creates and returns a pattern to fill polygon features
 *
 * @param {String} circleColor the color of the pattern circles
 * @param {String} backgroundColor the color of the pattern background
 * @returns {CanvasPattern} the pattern to fill the feature
 */
export default function getFillPattern (circleColor, backgroundColor) {
    const canvas = document.createElement("canvas"),
        context = canvas.getContext("2d");

    canvas.width = 8 * DEVICE_PIXEL_RATIO;
    canvas.height = 8 * DEVICE_PIXEL_RATIO;

    // Set the background color
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a circle to the canvas
    context.fillStyle = circleColor;
    context.beginPath();
    context.arc(
        4 * DEVICE_PIXEL_RATIO,
        4 * DEVICE_PIXEL_RATIO,
        1.5 * DEVICE_PIXEL_RATIO,
        0,
        2 * Math.PI
    );
    context.fill();

    return context.createPattern(canvas, "repeat");
}
