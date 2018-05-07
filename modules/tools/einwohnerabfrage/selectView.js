define(function (require) {

    var Backbone = require("backbone"),
        Einwohnerabfrage = require("modules/tools/einwohnerabfrage/model"),
        SnippetDropdownView = require("modules/snippets/dropdown/view"),
        ResultView = require("modules/tools/einwohnerabfrage/resultView"),
        Template = require("text!modules/tools/einwohnerabfrage/selectTemplate.html"),
        SelectView;

        SelectView = Backbone.View.extend({
        id: "einwohnerabfrage-tool",
        className: "win-body",
        model: new Einwohnerabfrage(),
        template: _.template(Template),
        snippetDropdownView: {},
        events: {
            "change select": "createDrawInteraction"
        },
        initialize: function () {
            this.listenTo(this.model, {
                // ändert sich der Fensterstatus wird neu gezeichnet
                "change:isCollapsed change:isCurrentWin": this.render,
                "renderResult": this.renderResult
            });
            this.snippetDropdownView = new SnippetDropdownView({model: this.model.getDropDownSnippet()});
        },
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template));
                this.$el.find(".dropdown").append(this.snippetDropdownView.render());
                this.delegateEvents();
            }
            else {
                this.model.reset();
                this.undelegateEvents();
            }
        },
        renderResult: function () {
            this.$el.find(".result").html("");
            this.$el.find(".result").append(new ResultView({ model: this.model}).render());
        },
        createDrawInteraction: function (evt) {
            this.model.get("drawInteraction").setActive(false);
            this.model.createDrawInteraction(evt.target.value);
        }
    });

    return SelectView;
});
