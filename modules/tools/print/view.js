define(function (require) {
    var PrintWinTemplate = require("text!modules/tools/print/template.html"),
        Print = require("modules/tools/print/model"),
        $ = require("jquery"),
        PrintView;

    PrintView = Backbone.View.extend({
        events: {
            "change #layoutField": "setLayout",
            "change #scaleField": "setScale",
            "click button": "createPDF"
        },
        initialize: function (attrs) {
            this.model = new Print(attrs);
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin change:scale": this.render
            });
        },
        className: "win-body",
        template: _.template(PrintWinTemplate),
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
            return this;
        }
    });
    return PrintView;
});
