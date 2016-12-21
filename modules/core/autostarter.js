define([
    "backbone",
    "backbone.radio"
], function (Backbone, Radio) {

    var Autostarter = Backbone.Model.extend({
        defaults: {
            autostartTools: [], // Liste aller zu startenden Tools
            initializedTools: [], // Liste aller geladenen Tools
            parametersAnalysed: false, // Boolean, ob ParametricURL abgefragt wurde
            configAnalysed: false // Boolean, ob config.json abgefragt wurde
        },
        initialize: function () {
            var channel = Radio.channel("Autostart");

            channel.on({
                "initializedTool": this.setInitializedTool
            }, this);

            Radio.on("MenuLoader", "ready", this.menuLoaded, this);

            Radio.on("ParametricURL", "ready", this.parametersAnalysed, this);

            this.listenTo(this, {
                "change:configAnalysed": this.check,
                "change:parametersAnalysed": this.check,
                "check": this.check
            });
        },
        /*
         * speichert sich alle geladenen Tools, die geladen wurden und prinzipiell geöffnet werden können.
         */
        setInitializedTool: function (id) {
            var initializedTools = this.get("initializedTools");

            initializedTools.push(id.toLowerCase());
            this.set("initializedTools", initializedTools);
            this.trigger("check");
        },
        /*
         * erst nachdem das Menü geladen ist kann der Parser per Radio abgefragt werden. In der config.json wird nach Tools mit autostart: true gesucht.
         */
        menuLoaded: function () {
            var configAutostart = Radio.request("Parser", "getItemsByAttributes", {autostart: true}),
                autostartTools = this.get("autostartTools"),
                configAutostartTools = [];

            _.each(configAutostart, function (tool) {
                if (_.has(tool, "type") && tool.type === "tool" && _.has(tool, "id")) {
                   configAutostartTools.push(tool.id.toLowerCase());
                }
            });
            if (configAutostartTools.length > 0) {
                this.set("autostartTools", configAutostartTools);
            }
            this.set("configAnalysed", true);
        },
        /*
         * wenn die Paramter der URL untersucht wurden, wird das StartUpModul in Erfahrung gebracht
         */
        parametersAnalysed: function () {
            var parametricAutostart = Radio.request("ParametricURL", "getStartUpModul").toString(),
                autostartParameter = parametricAutostart ? parametricAutostart : null,
                autostartTools = this.get("autostartTools");

            if (autostartParameter) {
                autostartTools.push(autostartParameter.toLowerCase());
                this.set("autostartTools", autostartTools);
            }
            this.set("parametersAnalysed", true);
        },
        /*
         * sofern das Modul in Erfahrung gebracht hat, welche Tools gestartet werden sollen, werden alle zwischenzeitlich geladenen Tools verglichen und ggf. gestartet.
         * Jedes gestartete Tool wird aus "autostartTools" wieder entfernt, damit dieses Modul sich am Ende selbst destroyen kann.
         */
        check: function () {
            if (this.get("parametersAnalysed") === true && this.get("configAnalysed") === true) {
                var autostartTools = this.get("autostartTools"),
                    initializedTools = this.get("initializedTools");

                if (autostartTools.length === 0) {
                    // es werden keine Tools automatisch gestartet. Autostarter wird nicht benötigt.
                    this.destroy();
                }
                else if (initializedTools.length > 0) {
                    // sofern Module schon initialisiert sind, können sie gestartet werden.
                    _.each(autostartTools, function (idToStart) {
                        if (_.indexOf(initializedTools, idToStart) !== -1) {
                            Radio.trigger("Autostart", "startTool", idToStart);
                            this.set("autostartTools", _.without(autostartTools, idToStart));
                        }
                    }, this);

                    if (this.get("autostartTools").length === 0) {
                        this.destroy();
                    }
                }
            }
        }
    });

    return Autostarter;
});
