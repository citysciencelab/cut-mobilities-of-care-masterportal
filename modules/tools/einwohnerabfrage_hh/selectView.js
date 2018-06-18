define(function (require) {

    var Backbone = require("backbone"),
        EinwohnerabfrageModel = require("modules/tools/einwohnerabfrage_hh/model"),
        SnippetDropdownView = require("modules/snippets/dropdown/view"),
        ResultView = require("modules/tools/einwohnerabfrage_hh/resultView"),
        Template = require("text!modules/tools/einwohnerabfrage_hh/selectTemplate.html"),
        SnippetCheckBoxView = require("modules/snippets/checkbox/view"),
        SelectView;

        SelectView = Backbone.View.extend({
        id: "einwohnerabfrage-tool",
        model: new EinwohnerabfrageModel(),
        className: "win-body",
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
            this.checkBoxRaster = new SnippetCheckBoxView({model: this.model.getCheckboxRaster()});
            this.checkBoxAddress = new SnippetCheckBoxView({model: this.model.getCheckboxAddress()});
        },
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template));
                this.$el.find(".dropdown").append(this.snippetDropdownView.render());
                this.$el.find(".checkbox").append(this.checkBoxRaster.render());
                this.$el.find(".checkbox").append(this.checkBoxAddress.render());

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
            this.model.getDrawInteraction().setActive(false);
            this.model.createDrawInteraction(evt.target.value);
        }
    });

    return SelectView;
});
