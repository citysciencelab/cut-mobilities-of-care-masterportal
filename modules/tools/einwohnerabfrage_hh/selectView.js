import SnippetDropdownView from "../../snippets/dropdown/view";
import ResultView from "./resultView";
import Template from "text-loader!./selectTemplate.html";
import SnippetCheckBoxView from "../../snippets/checkbox/view";

const SelectView = Backbone.View.extend({
    events: {
        "change select": "createDrawInteraction"
    },
    initialize: function () {
        this.listenTo(this.model, {
            // ändert sich der Fensterstatus wird neu gezeichnet
            "change:isActive": this.render,
            "renderResult": this.renderResult
        });
        this.snippetDropdownView = new SnippetDropdownView({model: this.model.get("snippetDropdownModel")});
        this.checkBoxRaster = new SnippetCheckBoxView({model: this.model.get("checkBoxRaster")});
        this.checkBoxAddress = new SnippetCheckBoxView({model: this.model.get("checkBoxAddress")});
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },
    id: "einwohnerabfrage-tool",
    template: _.template(Template),
    snippetDropdownView: {},
    render: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template());
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

export default SelectView;
