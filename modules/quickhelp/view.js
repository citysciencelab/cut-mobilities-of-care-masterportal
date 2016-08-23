define([
    "backbone",
    "backbone.radio",
    "text!modules/quickhelp/templateSearch.html",
    "text!modules/quickhelp/templateTree.html",
    "text!modules/quickhelp/templateMeasureTool.html",
    "eventbus",
    "modules/core/util",
    "jqueryui/widgets/draggable"
], function (Backbone, Radio, TemplateSearch, TemplateTree, TemplateMeasureTool, EventBus, Util) {

    var view = Backbone.View.extend({
        templateSearch: _.template(TemplateSearch),
        templateTree: _.template(TemplateTree),
        templateMeasureTool: _.template(TemplateMeasureTool),
        className: "quick-help-window ui-widget-content",
        events: {
            "click .glyphicon-remove": "removeWindow",
            "click .glyphicon-print": "printHelp"
        },
        initialize: function () {
            var channel = Radio.channel("Quickhelp");

            channel.on({
                "showWindowHelp": this.showWindow
            }, this);
            this.render();
            EventBus.on("showWindowHelp", this.showWindow, this);
            this.$el.draggable({
                containment: "#map",
                handle: ".header"
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
            switch (value) {
                case "search": {
                    this.$el.html(this.templateSearch({util: Util}));
                    break;
                }
                case "tree": {
                    this.$el.html(this.templateTree({util: Util}));
                    break;
                }
                case "measure": {
                    this.$el.html(this.templateMeasureTool({util: Util}));
                    break;
                }
                default: {
                    break;
                }
            }
            this.$el.show("slow");
        },
        /**
         * [printHelp description]
         */
        printHelp: function () {
            var htmlToPrint = document.getElementsByClassName("quick-help-window")[0],
                newWin = window.open("");

            newWin.document.write(htmlToPrint.outerHTML);
            newWin.print();
        }
    });

    return view;
});
