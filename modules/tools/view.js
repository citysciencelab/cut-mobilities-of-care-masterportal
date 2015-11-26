define([
    "backbone",
    "text!modules/tools/template.html",
    "modules/tools/model",
    "eventbus"
    ], function (Backbone, ToolsTemplate, Tools, EventBus) {

        var ToolsView = Backbone.View.extend({
            model: Tools,
            el: "#tools",
            template: _.template(ToolsTemplate),
            initialize: function () {
                this.render();
                this.listenTo(this.model, "change", this.render);
                EventBus.trigger("registerToolsClickInClickCounter", this.$el);
            },
            events: {
                "click #coordinateMenu": "activateCoordinate",
                "click #gfiMenu": "activateGFI",
                "click #measureMenu": "activateMeasure",
                "click #printMenu": "activatePrint",
                "click #drawMenu": "activateDraw",
                "click #recordMenu": "activateRecord"
            },
            render: function () {
                var attr = this.model.toJSON();

                this.$el.html(this.template(attr));
            },
            activateCoordinate: function () {
                this.model.setActive("coords");
                EventBus.trigger("winParams", [false, false, ""]);
                EventBus.trigger("closeWindow", false);
            },
            activateGFI: function () {
                this.model.setActive("gfi");
                EventBus.trigger("winParams", [false, false, ""]);
                EventBus.trigger("closeWindow", false);
            },
            activateMeasure: function () {
                EventBus.trigger("toggleWin", ["measure", "Messen", "glyphicon-resize-full"]);
                this.model.setActive("measure");
            },
            activateDraw: function () {
                EventBus.trigger("toggleWin", ["draw", "Zeichnen", "glyphicon-pencil"]);
                this.model.setActive("draw");
            },
            activatePrint: function () {
                EventBus.trigger("toggleWin", ["print", "Druckeinstellungen", "glyphicon-print"]);
                this.model.setActive("print");
            },
            activateRecord: function () {
                this.model.setActive("record");
                EventBus.trigger("toggleWin", ["record", "Datenerfassung", "glyphicon-edit"]);
            }
        });

        return ToolsView;
    });
