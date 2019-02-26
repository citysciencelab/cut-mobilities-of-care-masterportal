import ThemeView from "../view";
import VerkehrsStaerkenThemeRadTemplate from "text-loader!./template.html";

const VerkehrsStaerkenThemeRadView = ThemeView.extend({
    tagName: "div",
    className: "verkehrsstaerken_rad",
    template: _.template(VerkehrsStaerkenThemeRadTemplate),
    events: {
        "click .tab-toggle": "toggleTab"
    },
    /**
     * Überschreibt die Render-Funktion des Parent, da hier ein afterRender-Event wegen d3 genutzt werden muss.
     * @returns {void}
     */
    render: function () {
        var channel = Radio.channel("GFI"),
            attr;

        this.listenTo(channel, {
            "afterRender": this.getActiveDiagram
        }, this);

        if (_.isUndefined(this.model.get("gfiContent")) === false) {
            attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        }
    },
    getActiveDiagram: function () {
        var active = this.$el.find("li.active"),
            activeTab = active.length === 1 ? $(active[0]).attr("value") : null;

        if (this.model.get("isVisible") === true && activeTab) {
            this.loadDiagramm(activeTab);
        }
    },
    loadDiagramm: function (attr) {
        this.$(".graph svg").remove();
        this.model.setActiveTab(attr);
        this.model.setSize();
    },
    toggleTab: function (evt) {
        var contentId = this.$(evt.currentTarget).attr("value");

        // deactivate all tabs and their contents
        this.$(evt.currentTarget).parent().find("li").each(function (index, li) {
            var tabContentId = $(li).attr("value");

            $(li).removeClass("active");
            $("#" + tabContentId).removeClass("active");
            $("#" + tabContentId).removeClass("in");
        });
        // activate selected tab and its content
        $(evt.currentTarget).addClass("active");
        $("#" + contentId).addClass("active");
        $("#" + contentId).addClass("in");
        this.getActiveDiagram();
    }
});

export default VerkehrsStaerkenThemeRadView;
