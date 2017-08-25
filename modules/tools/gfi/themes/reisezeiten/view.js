define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        Radio = require("backbone.radio"),
        ReisezeitenTemplate = require("text!modules/tools/gfi/themes/reisezeiten/template.html"),
        ReisezeitenThemeView;

    ReisezeitenThemeView = ThemeView.extend({
        className: "panel panel-default",
        template: _.template(ReisezeitenTemplate),
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        events: {
            "remove": "destroy",
            "click .showroute": "startShowingRoute"
        },

        startShowingRoute: function (evt) {
            this.model.showRoute(evt.currentTarget.id);
            Radio.trigger("GFI", "setIsVisible", false);
        },

        /**
         * Removed das Routing-Objekt vollständig.
         * Wird beim destroy des GFI für alle Child-Objekte aufgerufen.
         */
        destroy: function () {
            this.model.removeRouteLayer();
            // this.unbind();
            // this.model.destroy();
        }
    });
    return ReisezeitenThemeView;
});
