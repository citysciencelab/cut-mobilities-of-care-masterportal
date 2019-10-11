import DefaultThemeView from "./default/view";
import DefaultTheme from "./default/model";
import Buildings3dThemeView from "./buildings3d/view";
import Buildings3dTheme from "./buildings3d/model";
import TableThemeView from "./table/view";
import TableTheme from "./table/model";
import ReisezeitenThemeView from "./reisezeiten/view";
import ReisezeitenTheme from "./reisezeiten/model";
import SolaratlasThemeView from "./solaratlas/view";
import SolaratlasTheme from "./solaratlas/model";
import TrinkwasserThemeView from "./trinkwasser/view";
import TrinkwasserTheme from "./trinkwasser/model";
import MietenspiegelThemeView from "./mietenspiegel/view";
import MietenspiegelTheme from "./mietenspiegel/model";
import SgvOnlineTheme from "./sgvonline/model";
import SgvOnlineThemeView from "./sgvonline/view";
import VerkehrsStaerkenTheme from "./verkehrsstaerken/model";
import VerkehrsStaerkenThemeView from "./verkehrsstaerken/view";
import SchulInfoTheme from "./schulinfo/model";
import SchulInfoThemeView from "./schulinfo/view";
import ContinuousCountingBikeTheme from "./continuousCountingBike/model";
import ContinuousCountingBikeThemeView from "./continuousCountingBike/view";
import ItGbmTheme from "./itgbm/model";
import ItGbmThemeView from "./itgbm/view";
import DipasThemeView from "./dipas/view";
import DipasTheme from "./dipas/model";
import FlaecheninfoTheme from "./flaecheninfo/model";
import FlaecheninfoThemeView from "./flaecheninfo/view";
import ElektroladesaeulenThemeView from "./elektroladesaeulen/view";
import ElektroladesaeulenTheme from "./elektroladesaeulen/model";
import ActiveCityMapsThemeView from "./activeCityMaps/view";
import ActiveCityMapsTheme from "./activeCityMaps/model";
import SchulenStandorteThemeView from "./bildungsatlas/schulenStandorte/view";
import SchulenStandorteTheme from "./bildungsatlas/schulenStandorte/model";
import SchulenEinzugsgebieteThemeView from "./bildungsatlas/schulenEinzugsgebiete/view";
import SchulenEinzugsgebieteTheme from "./bildungsatlas/schulenEinzugsgebiete/model";

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
        var gfiTheme = attrs.gfiTheme,
            theme;

        if (_.isObject(attrs.gfiTheme)) {
            attrs.gfiParams = gfiTheme.params;
            attrs.gfiTheme = gfiTheme.name;
        }

        if (attrs.gfiTheme === "table") {
            theme = new TableTheme(attrs, options);
        }
        else if (attrs.gfiTheme === "schulenStandorte") {
            theme = new SchulenStandorteTheme(attrs, options);
        }
        else if (attrs.gfiTheme === "schulenEinzugsgebiete") {
            theme = new SchulenEinzugsgebieteTheme(attrs, options);
        }
        else if (attrs.gfiTheme === "dipas") {
            theme = new DipasTheme(attrs, options);
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
        else if (attrs.gfiTheme === "continuousCountingBike") {
            theme = new ContinuousCountingBikeTheme(attrs, options);
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
        else if (attrs.gfiTheme === "activeCityMaps") {
            theme = new ActiveCityMapsTheme(attrs, options);
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
                    // WMS und WFS Layer die beim Klickpunkt keine GFIs haben
                    removeModels = this.filter(function (model) {
                        return model.get("gfiContent") === undefined || _.isEmpty(model.get("gfiContent"));
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
            case "schulenStandorte": {
                new SchulenStandorteThemeView({model: model});
                break;
            }
            case "schulenEinzugsgebiete": {
                new SchulenEinzugsgebieteThemeView({model: model});
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
            case "continuousCountingBike": {
                new ContinuousCountingBikeThemeView({model: model});
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
            case "activeCityMaps": {
                new ActiveCityMapsThemeView({model: model});
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
