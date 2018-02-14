define(function (require) {
    var ThemeView = require("modules/tools/gfi/themes/view"),
        VerkehrsStaerkenThemeRadTemplate = require("text!modules/tools/gfi/themes/verkehrsstaerken_rad/template.html"),
        VerkehrsStaerkenThemeRadView;

    VerkehrsStaerkenThemeRadView = ThemeView.extend({
        tagName: "div",
        className: "verkehrsstaerken_rad",
        template: _.template(VerkehrsStaerkenThemeRadTemplate),
        events: {
            "click .tab-toggle": "toggleTab"
        },
        /**
         * Überschreibt die Render-Funktion des Parent, da hier ein afterRender-Event wegen d3 genutzt werden muss.
         */
        render: function () {
            var channel = Radio.channel("GFI");

            this.listenTo(channel, {
                "afterRender": this.appended
            }, this);

            if (_.isUndefined(this.model.get("gfiContent")) === false) {
                var attr = this.model.toJSON(),
                    isViewMobile = Radio.request("Util", "isViewMobile");

                this.$el.html(this.template(attr));
            }
        },
        /**
         * Schaltet das GFI früher sichtbar, weil sonst die DIV-Größe nicht ermittelt werden kann.
         */
        appended: function () {
            var isViewMobile = Radio.request("Util", "isViewMobile");

            if (isViewMobile) {
                this.$el.closest(".gfi-mobile").modal();
            }
            else {
                this.$el.closest(".gfi").show(); // wenn ein GFI erneut geöffnet wird, ist .gfi hidden
            }

            this.getActiveDiagram();
        },
        getActiveDiagram: function () {
            var active = this.$el.find("li.active"),
                activeTab = active.length === 1 ? $(active[0]).attr("value") : null;

            if (activeTab) {
                this.loadDiagramm(activeTab);
            }
        },
        loadDiagramm: function (attr) {
            $(".graph svg").remove();
            this.model.setActiveTab(attr);
            this.model.setSize();
        },
        toggleTab: function (evt) {
            var contentId = $(evt.currentTarget).attr("value");

            // deactivate all tabs and their contents
            $(evt.currentTarget).parent().find("li").each(function (index, li) {
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

    return VerkehrsStaerkenThemeRadView;
});
