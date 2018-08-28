define(function (require) {

    var $ = require("jquery"),
        EinwohnerabfrageModel = require("modules/tools/einwohnerabfrage_hh/model"),
        SnippetDropdownView = require("modules/snippets/dropdown/view"),
        ResultView = require("modules/tools/einwohnerabfrage_hh/resultView"),
        Template = require("text!modules/tools/einwohnerabfrage_hh/selectTemplate.html"),
        SnippetCheckBoxView = require("modules/snippets/checkbox/view"),
        SelectView;

    SelectView = Backbone.View.extend({
        events: {
            "change select": "createDrawInteraction"
        },
        initialize: function (attr) {
            this.model = new EinwohnerabfrageModel(attr);
            this.listenTo(this.model, {
                // ändert sich der Fensterstatus wird neu gezeichnet
                "change:isCollapsed change:isCurrentWin": this.render,
                "renderResult": this.renderResult
            });
            this.snippetDropdownView = new SnippetDropdownView({model: this.model.get("snippetDropdownModel")});
            this.checkBoxRaster = new SnippetCheckBoxView({model: this.model.get("checkBoxRaster")});
            this.checkBoxAddress = new SnippetCheckBoxView({model: this.model.get("checkBoxAddress")});
        },
        id: "einwohnerabfrage-tool",
        className: "win-body",
        template: _.template(Template),
        snippetDropdownView: {},
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template));
                this.$el.find(".dropdown").append(this.snippetDropdownView.render().el);
                this.$el.find(".checkbox").append(this.checkBoxRaster.render().el);
                this.$el.find(".checkbox").append(this.checkBoxAddress.render().el);

                this.delegateEvents();
            }
            else {
                this.model.reset();
                this.undelegateEvents();
            }
            return this;
        },
        renderResult: function () {
            this.$el.find(".result").html("");
            this.$el.find(".result").append(new ResultView({model: this.model}).render().el);
        },
        createDrawInteraction: function (evt) {
            this.model.get("drawInteraction").setActive(false);
            this.model.createDrawInteraction(evt.target.value);
        }
    });

    return SelectView;
});
