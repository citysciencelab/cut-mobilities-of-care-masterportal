define([
    "backbone",
    "text!modules/print/template.html",
    "modules/print/model"
], function (Backbone, PrintWinTemplate, Print) {

    var view = Backbone.View.extend({
        model: new Print(),
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
            this.model.getLayersForPrint();
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        }
    });

        return view;
    });
