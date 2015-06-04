define([
    "backbone",
    "text!modules/quickhelp/templateSearch.html",
    "eventbus",
    "util",
    "jqueryui/draggable"
], function (Backbone, TemplateSearch, EventBus, Util) {

    var view = Backbone.View.extend({
        templateSearch: _.template(TemplateSearch),
        className: "quick-help-window ui-widget-content",
        events: {
            "click .glyphicon-remove": "removeWindow",
            "click .glyphicon-print": "printHelp"
        },
        initialize: function () {
            this.render();
            EventBus.on("showWindowHelp", this.showWindow, this);
            this.$el.draggable({
                containment: "#map"
            });
        },
        render: function () {
            $("body").append(this.$el);
        },
        removeWindow: function () {
            this.$el.hide("slow");
        },
        /**
         * [showWindow description]
         * @param {[type]} value [description]
         */
        showWindow: function (value) {
            var baseUrl = Util.getBaseUrl();

            switch (value) {
                case "search":
                    this.$el.html(this.templateSearch({util: Util}));
                    break;
                default:
                    break;
            }
            this.$el.show("slow");
        },
        /**
         * [printHelp description]
         */
        printHelp: function () {
            var htmlToPrint = document.getElementsByClassName("quick-help-window")[0],
                newWin= window.open("");

            newWin.document.write(htmlToPrint.outerHTML);
            newWin.print();
        }
    });

    return view;
});
