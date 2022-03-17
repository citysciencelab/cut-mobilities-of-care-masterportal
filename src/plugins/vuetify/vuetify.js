/**
 * loads vuetify from the path specified in the config.js
 * Thus custom themes and parameters can be set portal specifically
 * Returns undefined if vuetify is not configured in the config
 * @returns {module:Vuetify | undefined} the vuetify instance to use or undefined
 */
export async function instantiateVuetify () {
    if (!Object.prototype.hasOwnProperty.call(Config, "vuetify")) {
        return undefined;
    }
    if (typeof Config.vuetify !== "string") {
        console.error("Vuetify: Path to vuetify must be provided. Please check your config.js");
        return undefined;
    }

    try {
        const vuetify = await import(
            /* webpackChunkName: "[request]" */
            /* webpackInclude: /addons[\\\/].*[\\\/]index.js$/ */
            /* webpackExclude: /(node_modules)|(.+unittests.)|(.+test.)+/ */
            `../../../${Config.vuetify}`
        );

        return vuetify.default;
    }
    catch (e) {
        console.error(`Vuetify kann nicht vom Pfad ${Config.vuetify} geladen werden. Bitte überprüfen Sie den angegebenen Pfad in der config.js und versuchen Sie es erneut.`, e);
        return undefined;
    }
}
