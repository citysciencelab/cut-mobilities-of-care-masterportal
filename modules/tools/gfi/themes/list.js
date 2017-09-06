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
            else if (attrs.gfiTheme === "mietenspiegel") {
                return new MietenspiegelTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "sgvonline") {
                return new SgvOnlineTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "verkehrsstaerken") {
                return new VerkehrsStaerkenTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "schulinfo") {
                return new SchulInfoTheme(attrs, options);
            }
            else {
                return new DefaultTheme(attrs, options);
            }
        },
        initialize: function () {
            this.listenTo(this, {
                "reset": function () {
                    this.forEach(function (model) {
                        if (!_.isUndefined(model)) {
                            model.requestFeatureInfos();
                        }
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
