import DefaultThemeView from "./default/view";
import DefaultTheme from "./default/model";
import Buildings3dThemeView from "./buildings3d/view";
import Buildings3dTheme from "./buildings3d/model";
import ReisezeitenThemeView from "./reisezeiten/view";
import ReisezeitenTheme from "./reisezeiten/model";
import MietenspiegelThemeView from "./mietenspiegel/view";
import MietenspiegelTheme from "./mietenspiegel/model";
import SgvOnlineTheme from "./sgvOnline/model";
import SgvOnlineThemeView from "./sgvOnline/view";
import ItGbmTheme from "./itgbm/model";
import ItGbmThemeView from "./itgbm/view";

const ThemeList = Backbone.Collection.extend(/** @lends ThemeList.prototype */{
    /**
     * @class ThemeList
     * @extends Tools.GFI
     * @memberof Tools.GFI.Themes
     * @constructs
     * @param {attrs} attrs -
     * @param {options} options -
     * @listens gfiList#RadioTriggerRedraw
     * @fires MouseHover#RadioTriggerMouseHoverHide
     */
    model: function (attrs, options) {
        const gfiTheme = attrs.gfiTheme;
        let theme;

        if (typeof attrs.gfiTheme === "object") {
            attrs.gfiParams = gfiTheme.params;
            attrs.gfiTheme = gfiTheme.name;
        }

        if (attrs.gfiTheme === "reisezeiten") {
            theme = new ReisezeitenTheme(attrs, options);
        }
        else if (attrs.gfiTheme === "mietenspiegel") {
            theme = new MietenspiegelTheme(attrs, options);
        }
        else if (attrs.gfiTheme === "sgvonline") {
            theme = new SgvOnlineTheme(attrs, options);
        }
        else if (attrs.gfiTheme === "itgbm") {
            theme = new ItGbmTheme(attrs, options);
        }
        else if (attrs.gfiTheme === "buildings_3d") {
            theme = new Buildings3dTheme(attrs, options);
        }

        else {
            theme = new DefaultTheme(attrs, options);
        }
        return theme;
    },

    initialize: function () {
        const channel = Radio.channel("gfiList");

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
                let removeModels;

                if (this.pluck("isReady").includes(false) === false) {
                    // Wenn alle Model ihre GFI abgefragt und bearbeitet haben
                    // WMS und WFS Layer die beim Klickpunkt keine GFIs haben
                    removeModels = this.filter(function (model) {
                        return model.get("gfiContent") === undefined || !Object.entries(model.get("gfiContent") || {}).length;
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
            case "reisezeiten": {
                new ReisezeitenThemeView({model: model});
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
            case "itgbm": {
                new ItGbmThemeView({model: model});
                break;
            }
            case "buildings_3d": {
                new Buildings3dThemeView({model: model});
                break;
            }
            default: {
                new DefaultThemeView({model: model});
            }
        }
    },

    /**
     * handling on appendTheme
     * @param   {integer} themeIndex index of theme in array
     * @returns {void}
     */
    appendTheme: function (themeIndex) {
        this.setAllInVisible();
        this.at(themeIndex).setIsVisible(true);
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

export default ThemeList;
