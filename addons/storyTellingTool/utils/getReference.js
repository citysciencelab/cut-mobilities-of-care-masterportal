/**
 * Returns the reference to a story step
 *
 * @param {Number} chapterNumber the chapter number to identify the step
 * @param {Number} stepNumber the step number
 * @returns {String} the reference to the step
 */
export function getStepReference (chapterNumber, stepNumber) {
    return `${chapterNumber}.${stepNumber}`;
}

/**
 * Returns the reference to a step's HTML content
 *
 * @param {Number} chapterNumber the chapter number to identify the step the HTML content belongs to
 * @param {Number} stepNumber the step number to identify the step the HTML content belongs to
 * @returns {String} the reference to the HTML content
 */
export function getHTMLContentReference (chapterNumber, stepNumber) {
    return `step_${chapterNumber}-${stepNumber}`;
}
