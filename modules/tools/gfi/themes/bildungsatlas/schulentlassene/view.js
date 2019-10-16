import ThemeView from "../../view";
import SchulentlasseneTemplate from "text-loader!./template.html";

/**
 * @member SchulEntlasseneThemeTemplate
 * @description Template used to create gfi for SchulEntlassene
 * @memberof Tools.GFI.Themes.Bildungsatlas
 */

const SchulEntlasseneThemeView = ThemeView.extend({
    events: {
        "remove": "destroy"
    },

    render: function () {
        var attr = this.model.toJSON();
        this.$el.html(this.template(attr));

        // fix for gfi-content max-height set in modules/tools/gfi/desktop/detached/view.js
        setTimeout(function(){
            $(".gfi-content").css({
                "max-height": "none"
            });
        }, 100);

        return this;
    },

    tagName: "div",
    className: "schulentlassene-gfi-theme",
    template: _.template(SchulentlasseneTemplate)
});

export default SchulEntlasseneThemeView;
