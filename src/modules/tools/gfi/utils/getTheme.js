import upperFirst from "../../../../utils/upperFirst";
/**
 * Returns the right gfi Theme
 * it check if the right Theme (Component) is there, if yes just use this component, otherwise use the default theme
 * @param {String|Object} themeFromFeature configured theme
 * @param {Object} components components of the theme template
 * @param {Array} addonThemes list of names of themes defined in addons
 * @returns {String} the name of the gfi Theme
 */
function getTheme (themeFromFeature, components, addonThemes) {
    const gfiComponents = Object.keys(components),
        configTheme = upperFirst(themeFromFeature && typeof themeFromFeature === "object" ? themeFromFeature.name : themeFromFeature);
    let theme = "";

    if (gfiComponents && Array.isArray(gfiComponents) && gfiComponents.length && gfiComponents.includes(configTheme)) {
        theme = configTheme;
    }
    else if (addonThemes && addonThemes.includes(configTheme)) {
        theme = configTheme;
    }
    else {
        console.warn(String("The gfi theme '" + configTheme + "' could not be found, the default theme will be used. Please check your configuration!"));
        theme = "Default";
    }

    return theme;
}

export default getTheme;
