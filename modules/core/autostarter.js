define([
    "backbone",
    "backbone.radio"
], function (Backbone, Radio) {

    var Autostarter = Backbone.Model.extend({
        defaults: {
            autostartModuls: [], // Liste aller zu startenden Module
            initializedModuls: [], // Liste aller geladenen Module
            parametersAnalysed: false, // Boolean, ob ParametricURL abgefragt wurde
            configAnalysed: false // Boolean, ob config.json abgefragt wurde
        },
        initialize: function () {
            var channel = Radio.channel("Autostart");

            channel.on({
                "initializedModul": this.setInitializedModul
            }, this);

            Radio.on("MenuLoader", "ready", this.menuLoaded, this);

            Radio.on("ParametricURL", "ready", this.parametersAnalysed, this);
        },
        /*
         * speichert sich alle geladenen Module, die geladen wurden und prinzipiell geöffnet werden können.
         */
        setInitializedModul: function (id) {
            var initializedModuls = this.get("initializedModuls");

            initializedModuls.push(id.toLowerCase());
            this.set("initializedModuls", initializedModuls);
            this.check();
        },
        /*
         * erst nachdem das Menü geladen ist kann der Parser per Radio abgefragt werden. In der config.json wird nach Modulen mit isInitOpen: true gesucht.
         */
        menuLoaded: function () {
            var configAutostart = Radio.request("Parser", "getItemsByAttributes", {isInitOpen: true});

            _.each(configAutostart, function (modul) {
                if (_.has(modul, "id")) {
                   this.get("autostartModuls").push(modul.id.toLowerCase());
                }
            }, this);
            this.set("configAnalysed", true);
            this.check();
        },
        /*
         * wenn die Paramter der URL untersucht wurden, werden die isInitOpen Module in Erfahrung gebracht
         */
        parametersAnalysed: function () {
            var parametricAutostart = Radio.request("ParametricURL", "getIsInitOpen").toString(),
                autostartParameter = parametricAutostart ? parametricAutostart : null,
                autostartModuls = this.get("autostartModuls");

            if (autostartParameter) {
                _.each(autostartParameter.toLowerCase().split(","), function (paramEl) {
                    autostartModuls.push(paramEl);
                });
            }
            this.set("autostartModuls", autostartModuls);
            this.set("parametersAnalysed", true);
            this.check();
        },
        /*
         * sofern das Modul in Erfahrung gebracht hat, welche Module gestartet werden sollen, werden alle zwischenzeitlich geladenen Module verglichen und ggf. gestartet.
         * Jedes gestartete Modul wird aus "autostartModuls" wieder entfernt, damit dieses Modul sich am Ende selbst destroyen kann.
         * Jedes später geladene Tool, welches initial geöffnet sein soll schließt bereits vorher geöffnete.
         * Parameter werden vor der config gelesen.
         */
        check: function () {
            if (this.get("parametersAnalysed") === true && this.get("configAnalysed") === true) {
                var autostartModuls = this.get("autostartModuls"),
                    initializedModuls = this.get("initializedModuls");

                if (autostartModuls.length === 0) {
                    // es werden keine Module automatisch gestartet. Autostarter wird nicht benötigt.
                    this.destroy();
                }
                else if (initializedModuls.length > 0) {
                    // sofern Module schon initialisiert sind, können sie gestartet werden.
                    _.each(autostartModuls, function (idToStart) {
                        if (_.indexOf(initializedModuls, idToStart) !== -1) {
                            Radio.trigger("Autostart", "startModul", idToStart);
                            this.set("autostartModuls", _.without(autostartModuls, idToStart));
                        }
                    }, this);

                    if (this.get("autostartModuls").length === 0) {
                        this.destroy();
                    }
                }
            }
        }
    });

    return Autostarter;
});
