define(function (require) {

    var Backbone = require("backbone"),
        DefaultThemeView = require("modules/gfi/themes/default/view"),
        DefaultTheme = require("modules/gfi/themes/default/model"),
        TableThemeView = require("modules/gfi/themes/table/view"),
        TableTheme = require("modules/gfi/themes/table/model"),
        ReisezeitenThemeView = require("modules/gfi/themes/reisezeiten/view"),
        ReisezeitenTheme = require("modules/gfi/themes/reisezeiten/model"),
        SolaratlasThemeView = require("modules/gfi/themes/solaratlas/view"),
        SolaratlasTheme = require("modules/gfi/themes/solaratlas/model"),
        TrinkwasserThemeView = require("modules/gfi/themes/trinkwasser/view"),
        TrinkwasserTheme = require("modules/gfi/themes/trinkwasser/model"),
        ThemeList;

    ThemeList = Backbone.Collection.extend({
        model: function (attrs, options) {
            if (attrs.gfiTheme === "table") {
                return new TableTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "reisezeiten") {
                return new ReisezeitenTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "solaratlas") {
                return new SolaratlasTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "trinkwasser") {
                return new TrinkwasserTheme(attrs, options);
            }
            else {
                return new DefaultTheme(attrs, options);
            }
        },
        initialize: function () {
            this.listenTo(this, {
                "reset": function () {
                    this.forEach(function (model) {
                        model.requestFeatureInfos();
                    });
                },
                "change:isReady": function () {
                    // Wenn alle Model ihre GFI abgefragt und bearbeitet haben
                    if (_.contains(this.pluck("isReady"), false) === false) {
                        // WMS Layer die beim Klickpunkt keine GFIs haben
                        var removeModels = this.filter(function (model) {
                            return model.get("gfiContent") === undefined;
                        });

                        this.remove(removeModels);
                        this.forEach(this.addView, this);
                        // listener in modules/gfi/model.js
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
                default: {
                    new DefaultThemeView({model: model});
                }
            }
        },

        appendTheme: function (value) {
            this.setAllInVisible();
            this.at(value).setIsVisible(true);
        },

        /**
         * Setzt visibility aller Themes auf false
         */
        setAllInVisible: function () {
            this.forEach(function (model) {
                model.setIsVisible(false);
            });
        }
    });

    return ThemeList;
});
