import ThemeView from "../view";
import ReisezeitenTemplate from "text-loader!./template.html";

const ReisezeitenThemeView = ThemeView.extend({
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
     * @returns {void}
     */
    destroy: function () {
        this.model.removeRouteLayer();
        // this.unbind();
        // this.model.destroy();
    }
});

export default ReisezeitenThemeView;
