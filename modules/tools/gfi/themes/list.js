define(function (require) {

    var Backbone = require("backbone"),
        DefaultThemeView = require("modules/tools/gfi/themes/default/view"),
        DefaultTheme = require("modules/tools/gfi/themes/default/model"),
        TableThemeView = require("modules/tools/gfi/themes/table/view"),
        TableTheme = require("modules/tools/gfi/themes/table/model"),
        ReisezeitenThemeView = require("modules/tools/gfi/themes/reisezeiten/view"),
        ReisezeitenTheme = require("modules/tools/gfi/themes/reisezeiten/model"),
        SolaratlasThemeView = require("modules/tools/gfi/themes/solaratlas/view"),
        SolaratlasTheme = require("modules/tools/gfi/themes/solaratlas/model"),
        TrinkwasserThemeView = require("modules/tools/gfi/themes/trinkwasser/view"),
        TrinkwasserTheme = require("modules/tools/gfi/themes/trinkwasser/model"),
        MietenspiegelThemeView = require("modules/tools/gfi/themes/mietenspiegel/view"),
        MietenspiegelTheme = require("modules/tools/gfi/themes/mietenspiegel/model"),
        SgvOnlineTheme = require("modules/tools/gfi/themes/sgvonline/model"),
        SgvOnlineThemeView = require("modules/tools/gfi/themes/sgvonline/view"),
        VerkehrsStaerkenTheme = require("modules/tools/gfi/themes/verkehrsstaerken/model"),
        VerkehrsStaerkenThemeView = require("modules/tools/gfi/themes/verkehrsstaerken/view"),
        SchulInfoTheme = require("modules/tools/gfi/themes/schulinfo/model"),
        SchulInfoThemeView = require("modules/tools/gfi/themes/schulinfo/view"),
        VerkehrsStaerkenRadTheme = require("modules/tools/gfi/themes/verkehrsstaerken_rad/model"),
        VerkehrsStaerkenRadThemeView = require("modules/tools/gfi/themes/verkehrsstaerken_rad/view"),
        ItGbmTheme = require("modules/tools/gfi/themes/itgbm/model"),
        ItGbmThemeView = require("modules/tools/gfi/themes/itgbm/view"),
        DipasThemeView = require("modules/tools/gfi/themes/dipas/view"),
        FlaecheninfoTheme = require("modules/tools/gfi/themes/flaecheninfo/model"),
        FlaecheninfoThemeView = require("modules/tools/gfi/themes/flaecheninfo/view"),
        ElektroladesaeulenThemeView = require("modules/tools/gfi/themes/elektroladesaeulen/view"),
        ElektroladesaeulenTheme = require("modules/tools/gfi/themes/elektroladesaeulen/model"),
        ThemeList;

    ThemeList = Backbone.Collection.extend({
        model: function (attrs, options) {
            var gfiTheme = attrs.gfiTheme,
                theme;

            if (_.isObject(attrs.gfiTheme)) {
                attrs.gfiParams = gfiTheme.params;
                attrs.gfiTheme = gfiTheme.name;
            }

            if (attrs.gfiTheme === "table") {
                theme = new TableTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "reisezeiten") {
                theme = new ReisezeitenTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "solaratlas") {
                theme = new SolaratlasTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "trinkwasser") {
                theme = new TrinkwasserTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "mietenspiegel") {
                theme = new MietenspiegelTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "sgvonline") {
                theme = new SgvOnlineTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "verkehrsstaerken") {
                theme = new VerkehrsStaerkenTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "schulinfo") {
                theme = new SchulInfoTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "verkehrsstaerken_rad") {
                theme = new VerkehrsStaerkenRadTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "itgbm") {
                theme = new ItGbmTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "flaecheninfo") {
                theme = new FlaecheninfoTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "elektroladesaeulen") {
                theme = new ElektroladesaeulenTheme(attrs, options);
            }
            else {
                theme = new DefaultTheme(attrs, options);
            }
            return theme;
        },

        initialize: function () {
            var channel = Radio.channel("gfiList");

            // get new feature data
            this.listenTo(channel, {
                redraw: function () {
                    this.forEach(function (model) {
                        model.requestFeatureInfos();
                    });
                }
            });

            this.listenTo(this, {
                "reset": function () {
                    this.forEach(function (model) {
                        model.requestFeatureInfos();
                    });
                },
                "change:isReady": function () {
                    var removeModels;

                    if (_.contains(this.pluck("isReady"), false) === false) {
                    // Wenn alle Model ihre GFI abgefragt und bearbeitet haben
                        // WMS Layer die beim Klickpunkt keine GFIs haben
                        removeModels = this.filter(function (model) {
                            return model.get("gfiContent") === undefined;
                        });

                        this.remove(removeModels);
                        this.forEach(this.addView, this);
                        // listener in modules/tools/gfi/model.js
                        this.trigger("isReady");
                    }
                }
            });
        },

        addView: function (model) {
            switch (model.get("gfiTheme")) {
                case "table": {
                    new TableThemeView({model: model});
                    break;
                }
                case "reisezeiten": {
                    new ReisezeitenThemeView({model: model});
                    break;
                }
                case "solaratlas": {
                    new SolaratlasThemeView({model: model});
                    break;
                }
                case "trinkwasser": {
                    new TrinkwasserThemeView({model: model});
                    break;
                }
                case "mietenspiegel": {
                    new MietenspiegelThemeView({model: model});
                    break;
                }
                case "sgvonline": {
                    new SgvOnlineThemeView({model: model});
                    break;
                }
                case "verkehrsstaerken": {
                    new VerkehrsStaerkenThemeView({model: model});
                    break;
                }
                case "schulinfo": {
                    new SchulInfoThemeView({model: model});
                    break;
                }
                case "verkehrsstaerken_rad": {
                    new VerkehrsStaerkenRadThemeView({model: model});
                    break;
                }
                case "itgbm": {
                    new ItGbmThemeView({model: model});
                    break;
                }
                case "dipas": {
                    new DipasThemeView({model: model});
                    break;
                }
                case "flaecheninfo": {
                    new FlaecheninfoThemeView({model: model});
                    break;
                }
                case "elektroladesaeulen": {
                    new ElektroladesaeulenThemeView({model: model});
                    break;
                }
                default: {
                    new DefaultThemeView({model: model});
                }
            }
        },

        appendTheme: function (value) {
            this.setAllInVisible();
            this.at(value).setIsVisible(true);
            Radio.trigger("MouseHover", "hide");
        },

        /**
         * Setzt visibility aller Themes auf false
         * @return {undefined}
         */
        setAllInVisible: function () {
            this.forEach(function (model) {
                model.setIsVisible(false);
            });
        }
    });

    return ThemeList;
});
