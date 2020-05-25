const Autostarter = Backbone.Model.extend({
    defaults: {
        autostartModuls: [], // array of all modules to open on startup
        initializedModuls: [], // array of all initialized modules
        parametersAnalysed: false, // boolean, if ParametricURL was checked already
        configAnalysed: false, // boolean, if config.json was checked already
        channel: Radio.channel("Autostart")
    },
    initialize: function () {
        const channel = this.get("channel");

        channel.on({
            "initializedModul": this.setInitializedModul
        }, this);

        Radio.once("Menuloader", "ready", this.menuLoaded, this);

        Radio.once("ParametricURL", "ready", this.parametersAnalysed, this);
    },
    /**
     * fills defaults.initializedModuls with ids of initialized modules - from now on these modules can be used
     * @param {Number} id the id of the module to be flaged as initialized
     * @returns {Void}  -
     */
    setInitializedModul: function (id) {
        const initializedModuls = this.get("initializedModuls");

        initializedModuls.push(id.toLowerCase());
        this.set("initializedModuls", initializedModuls);
        this.check();
    },
    /**
     * looks for modules with isInitOpen = true in config.json to add them to defaults.autostartModules
     * @info the parser can only be questioned (via Radio) after the menue was loaded
     * @pre defaults.configAnalysed is false, defaults.autostartModuls might be empty
     * @post defaults.configAnalysed is true, ids of layers marked with isInitOpen in config.json are added to defaults.autostartModuls
     * @returns {Void}  -
     */
    menuLoaded: function () {
        const configAutostart = Radio.request("Parser", "getItemsByAttributes", {isInitOpen: true});

        configAutostart.forEach(function (modul) {
            if (modul.hasOwnProperty("id")) {
                this.get("autostartModuls").push(modul.id.toLowerCase());
            }
        }, this);
        this.set("configAnalysed", true);
        this.check();
    },
    /**
     * uses Radio ParametricURL to look for parameter isInitOpen in the url, adds found module names unchecked into autostartModuls
     * @pre defaults.parametersAnalysed is false, defaults.autostartModuls might be empty
     * @post defaults.parametersAnalysed is true, names of layers given by url are added to defaults.autostartModuls
     * @returns {Void}  -
     */
    parametersAnalysed: function () {
        const isInitOpen = Radio.request("ParametricURL", "getIsInitOpen"),
            parametricAutostart = isInitOpen !== undefined ? isInitOpen.toString() : undefined,
            autostartParameter = parametricAutostart ? parametricAutostart : null,
            autostartModuls = this.get("autostartModuls");

        if (autostartParameter) {
            autostartParameter.toLowerCase().split(",").forEach(function (paramEl) {
                autostartModuls.push(paramEl);
            });
        }
        this.set("autostartModuls", autostartModuls);
        this.set("parametersAnalysed", true);
        this.check();
    },
    /**
     * If the module has found out which modules are to be started, all modules loaded in the meantime are compared and started if necessary
     * Every started module is removed from "autostartModul", so that this module can destroy itself in the end.
     * Every later loaded tool, which should be opened initially, closes previously opened tools.
     * Parameters are read before the config has been read.
     * @returns {Void}  -
     */
    check: function () {
        let autostartModuls,
            initializedModuls;

        if (this.get("parametersAnalysed") === true && this.get("configAnalysed") === true) {
            autostartModuls = this.get("autostartModuls");
            initializedModuls = this.get("initializedModuls");
            if (autostartModuls.length === 0) {
                // no modules are started automatically. Autostarter is not required.
                this.unloadModule();
            }
            else if (initializedModuls.length > 0) {
                // if modules are already initialized, they can be started.
                autostartModuls.forEach(function (idToStart) {
                    if (initializedModuls.indexOf(idToStart) !== -1) {
                        Radio.trigger("Autostart", "startModul", idToStart);
                        this.set("autostartModuls", Radio.request("Util", "differenceJs", autostartModuls, [idToStart]));
                    }
                }, this);

                if (this.get("autostartModuls").length === 0) {
                    this.unloadModule();
                }
            }
        }
    },
    /**
     * unloads this module, resets all channels, clears and destroys this module
     * @returns {Void}  -
     */
    unloadModule: function () {
        const channel = this.get("channel");

        // reset all channels from the radio object
        channel.reset();
        this.clear();
        this.destroy();
    }
});

export default Autostarter;
