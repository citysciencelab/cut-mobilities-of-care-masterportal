define([
    "backbone",
    "text!modules/tools/print/template.html",
    "modules/tools/print/model"
], function (Backbone, PrintWinTemplate, Print) {

    var view = Backbone.View.extend({
        model: new Print(),
        className: "win-body",
        template: _.template(PrintWinTemplate),
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin change:scale": this.render
            });
        },
        events: {
            "change #layoutField": "setLayout",
            "change #scaleField": "setScale",
            "click button": "createPDF"
        },
        setLayout: function (evt) {
            this.model.setLayout(evt.target.selectedIndex);
        },
        setScale: function (evt) {
            this.model.setScale(evt.target.selectedIndex);
        },
        createPDF: function () {
            this.model.setTitleFromForm();
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
