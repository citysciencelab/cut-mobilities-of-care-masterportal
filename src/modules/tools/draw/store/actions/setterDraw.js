/**
 * Function to adjust the value / diameter to the units meters or kilometers.
 *
 * @param {String} diameter diameter of the circle.
 * @param {String} unit unit of the diameter.
 * @return {(String|Number)} returns value / string without comma.
 */
function adjustValueToUnits (diameter, unit) {
    return unit === "km" ? diameter * 1000 : diameter;
}

/**
 * Sets the active property of the state to the given value.
 * Also starts processes if the tool is be activated (active === true).
 *
 * @param {Object} context actions context object.
 * @param {Boolean} active Value deciding whether the tool gets activated or deactivated.
 * @returns {void}
 */
function setActive ({state, commit, dispatch, rootState}, active) {
    commit("setActive", active);

    if (active) {
        commit("setLayer", Radio.request("Map", "createLayerIfNotExists", "import_draw_layer"));
        commit("setImgPath", rootState?.configJs?.wfsImgPath);

        dispatch("createDrawInteractionAndAddToMap", {active: true});
        dispatch("createSelectInteractionAndAddToMap", false);
        dispatch("createModifyInteractionAndAddToMap", false);

        if (state.withoutGUI) {
            dispatch("toggleInteraction", "draw");
        }
    }
}

/**
 * Sets the inner diameter for the circle.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the circleInnerDiameter.
 * @param {HTMLInputElement} event.target The HTML input element for the circleInnerDiameter.
 * @returns {void}
 */
function setCircleInnerDiameter ({state, commit}, {target}) {
    const adjustedInnerDiameter = adjustValueToUnits(target.value, state.unit);

    commit("setCircleInnerDiameter", parseFloat(adjustedInnerDiameter));
}

/**
 * Sets the method for drawing a circle.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the circleMethod.
 * @param {HTMLSelectElement} event.target The HTML select element for the circleMethod.
 * @returns {void}
 */
function setCircleMethod ({commit}, {target}) {
    const circleMethod = target.options[target.selectedIndex].value;

    commit("setCircleMethod", circleMethod);
}

/**
 * Sets the outer diameter for the circle.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the circleOuterDiameter.
 * @param {HTMLInputElement} event.target The HTML input element for the circleOuterDiameter.
 * @returns {void}
 */
function setCircleOuterDiameter ({state, commit}, {target}) {
    const adjustedOuterDiameter = adjustValueToUnits(target.value, state.unit);

    commit("setCircleOuterDiameter", parseFloat(adjustedOuterDiameter));
}

/**
 * Sets the color.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the color.
 * @param {HTMLSelectElement} event.target The HTML select element for the color.
 * @returns {void}
 */
function setColor ({state, commit, dispatch}, {target}) {
    const color = target.options[target.selectedIndex].value.split(","),
        newColor = [];

    color.forEach(val => {
        newColor.push(parseInt(val, 10));
    });
    newColor.push(state.opacity);

    commit("setColor", newColor);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the color of the contours.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the colorContour.
 * @param {HTMLSelectElement} event.target The HTML select element for the colorContour.
 * @returns {void}
 */
function setColorContour ({state, commit, dispatch}, {target}) {
    const colorContour = target.options[target.selectedIndex].value.split(","),
        newColorContour = [];

    colorContour.forEach(val => {
        newColorContour.push(parseInt(val, 10));
    });
    newColorContour.push(state.opacityContour);

    commit("setColorContour", newColorContour);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the drawType and triggers other methods to add the new interactions
 * to the map and remove the old one.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the drawType.
 * @param {HTMLSelectElement} event.target The HTML select element for the drawTypes.
 * @returns {void}
 */
function setDrawType ({commit, dispatch}, {target}) {
    const selectedElement = target.options[target.selectedIndex];

    commit("setFreeHand", selectedElement.id === "drawCurve");
    commit("setCircleMethod", selectedElement.id === "drawDoubleCircle" ? "defined" : "interactive");
    commit("setDrawType", {id: selectedElement.id, geometry: selectedElement.value});

    dispatch("updateDrawInteraction");
}

/**
 * Sets the font for the text.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the font.
 * @param {HTMLSelectElement} event.target The HTML select element for the font.
 * @returns {void}
 */
function setFont ({commit, dispatch}, {target}) {
    const font = target.options[target.selectedIndex].value;

    commit("setFont", font);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the size font for the text.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the fontSize.
 * @param {HTMLSelectElement} event.target The HTML select element for the fontSize.
 * @returns {void}
 */
function setFontSize ({commit, dispatch}, {target}) {
    const fontSize = target.options[target.selectedIndex].value;

    commit("setFontSize", fontSize);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the opacity.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the opacity.
 * @param {HTMLSelectElement} event.target The HTML select element for the opacity.
 * @returns {void}
 */
function setOpacity ({state, commit, dispatch}, {target}) {
    const opacity = parseFloat(target.options[target.selectedIndex].value),
        color = state.color;

    color[3] = opacity;

    commit("setOpacity", opacity);
    commit("setColor", color);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the opacity of the contours.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the opacityContour.
 * @param {HTMLSelectElement} event.target The HTML select element for the opacityContour.
 * @returns {void}
 */
function setOpacityContour ({state, commit, dispatch}, {target}) {
    const opacityContour = parseFloat(target.options[target.selectedIndex].value),
        colorContour = state.colorContour;

    colorContour[3] = opacityContour;

    commit("setOpacityContour", opacityContour);
    commit("setColorContour", colorContour);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the size of the point.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the pointSize.
 * @param {HTMLSelectElement} event.target The HTML select element for the pointSize.
 * @returns {void}
 */
function setPointSize ({commit, dispatch}, {target}) {
    const selectedElement = target.options[target.selectedIndex];

    commit("setPointSize", parseInt(selectedElement.value, 10));
    dispatch("updateDrawInteraction");
}

/**
 * Sets the strokwidth.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the strokewidth.
 * @param {HTMLSelectElement} event.target The HTML select element for the strokewidth.
 * @returns {void}
 */
function setStrokeWidth ({commit, dispatch}, {target}) {
    const strokeWidth = target.options[target.selectedIndex].value;

    commit("setStrokeWidth", parseInt(strokeWidth, 10));
    dispatch("updateDrawInteraction");
}

/**
 * Sets the symbol.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the symbol.
 * @param {HTMLSelectElement} event.target The HTML select element for the symbol.
 * @returns {void}
 */
function setSymbol ({state, commit, dispatch}, {target}) {
    const selectedElement = target.options[target.selectedIndex],
        iconList = Object.values(state.iconList);

    // Find the correct symbol
    // NOTE: caption is deprecated in 3.0.0
    commit("setSymbol", iconList.filter(icon => icon.id ? icon.id === selectedElement.value : icon.caption === selectedElement.value)[0]);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the text.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the text.
 * @param {HTMLInputElement} event.target The HTML input element for the text.
 * @returns {void}
 */
function setText ({commit, dispatch}, {target}) {
    commit("setText", target.value);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the unit for the diameter of the circle.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the unit.
 * @param {HTMLSelectElement} event.target The HTML select element for the unit.
 * @returns {void}
 */
function setUnit ({state, commit, dispatch}, {target}) {
    const unit = target.options[target.selectedIndex].value;

    // Find the correct symbol
    commit("setUnit", unit);
    dispatch("setCircleInnerDiameter", {target: {value: state.circleInnerDiameter}});
    dispatch("setCircleOuterDiameter", {target: {value: state.circleOuterDiameter}});
}

export {
    setActive,
    setCircleInnerDiameter,
    setCircleMethod,
    setCircleOuterDiameter,
    setColor,
    setColorContour,
    setDrawType,
    setFont,
    setFontSize,
    setOpacity,
    setOpacityContour,
    setPointSize,
    setStrokeWidth,
    setSymbol,
    setText,
    setUnit
};
