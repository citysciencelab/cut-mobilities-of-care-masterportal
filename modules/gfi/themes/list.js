define(function (require) {

    var Backbone = require("backbone"),
        DefaultThemeView = require("modules/gfi/themes/default/view"),
        DefaultTheme = require("modules/gfi/themes/default/model"),
        TableThemeView = require("modules/gfi/themes/table/view"),
        TableTheme = require("modules/gfi/themes/table/model"),
        ReisezeitenThemeView = require("modules/gfi/themes/reisezeiten/view"),
        ReisezeitenTheme = require("modules/gfi/themes/reisezeiten/model"),
        ThemeList;

    ThemeList = Backbone.Collection.extend({
        model: function (attrs, options) {
            if (attrs.gfiTheme === "table") {
                return new TableTheme(attrs, options);
            }
            else if (attrs.gfiTheme === "reisezeiten") {
                return new ReisezeitenTheme(attrs, options);
            }
            else {
                return new DefaultTheme(attrs, options);
            }
        },
        initialize: function () {
            this.listenTo(this, {
                "reset": function () {
                    this.forEach(function (model) {
                        model.requestFeatures();
                    });
                }
            });
            this.listenTo(this, {
                "change:ready": function () {console.log("ready");
                    // console.log(this.pluck("ready"));
                    if (_.contains(this.pluck("ready"), false) === false) {
                        var removeModels = this.filter(function (model) {
                            return model.get("gfiContent") === undefined;
                        });
                        this.remove(removeModels);
                        this.addViews();
                        this.trigger("ready");
                    }
                }
            });
        },

        addViews: function () {
            this.forEach(this.addView, this);
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
                default: {
                    new DefaultThemeView({model: model});
                }
            }
        },

        appendTheme: function (value) {
            this.setAllInVisible();
            this.at(value).setIsVisible(true);
        },

        setAllInVisible: function () {
            this.forEach(function (model) {console.log(model);
                model.setIsVisible(false);
            });
        }
    });

    return ThemeList;
});
