define(function (require) {

    var Backbone = require("backbone"),
        Einwohnerabfrage = require("modules/tools/einwohnerabfrage/model"),
        EinwohnerabfrageTemplate = require("text!modules/tools/einwohnerabfrage/template.html"),
        EinwohnerabfrageView;

    EinwohnerabfrageView = Backbone.View.extend({
        model: new Einwohnerabfrage(),
        id: "einwohnerabfrage-tool",
        className: "win-body",
        template: _.template(EinwohnerabfrageTemplate),
        events: {
        },
        initialize: function () {
            this.listenTo(this.model, {
                // ändert sich der Fensterstatus wird neu gezeichnet
                "change:isCollapsed change:isCurrentWin": this.render
            });
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

    return EinwohnerabfrageView;
});
