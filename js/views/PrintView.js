define([
    "jquery",
    "underscore",
    "backbone",
    "text!../../templates/PrintWin.html",
    "models/Print",
    "eventbus"
    ], function ($, _, Backbone, PrintWinTemplate, Print, EventBus) {

        var PrintView = Backbone.View.extend({
            model: Print,
            className: "win-body",
            template: _.template(PrintWinTemplate),
            initialize: function () {
                this.model.on("change:isCollapsed change:isCurrentWin change:currentScale", this.render, this);
            },
            events: {
                "change #layoutField": "setCurrentLayout",
                "change #scaleField": "setCurrentScale",
                "click button": "getLayersForPrint"
            },
            setCurrentLayout: function (evt) {
                this.model.setCurrentLayout(evt.target.selectedIndex);
            },
            setCurrentScale: function (evt) {
                this.model.setCurrentScale(evt.target.selectedIndex);
            },
            getLayersForPrint: function () {
                $("#loader").show();
                this.model.getLayersForPrint();
            },
            render: function () {
                if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                    var attr = this.model.toJSON();
                    this.$el.html("");
                    $(".win-heading").after(this.$el.html(this.template(attr)));
                    this.delegateEvents();
                }
                else {
                    this.undelegateEvents();
                }
            }
        });

        return PrintView;
    });
