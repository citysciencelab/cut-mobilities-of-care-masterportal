import DefaultTemplate from "text-loader!./default/template.html";
import TableTemplate from "text-loader!./table/template.html";
import SnippetDropdownView from "../../snippets/dropdown/view";

const MeasureView = Backbone.View.extend({
    events: {
        "click button.table-tool-measure-delete": "deleteFeatures",
        "click button.measure-delete": "deleteFeatures",
        "click .form-horizontal > .form-group-sm > .col-sm-12 > .glyphicon-question-sign": function () {
            Radio.trigger("Quickhelp", "showWindowHelp", "measure");
        }
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        });
        this.snippetDropdownViewGeometry = new SnippetDropdownView({model: this.model.get("snippetDropdownModelGeometry")});
        this.snippetDropdownViewUnit = new SnippetDropdownView({model: this.model.get("snippetDropdownModelUnit")});
        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    render: function (model, value) {
        var template;

        if (value) {
            template = Radio.request("Util", "getUiStyle") === "TABLE" ? _.template(TableTemplate) : _.template(DefaultTemplate);
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(template(model.toJSON()));
            this.$el.find(".dropdown_geometry").append(this.snippetDropdownViewGeometry.render().el);
            this.$el.find(".dropdown_unit").append(this.snippetDropdownViewUnit.render().el);
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
            this.unregisterListener();
            this.removeIncompleteDrawing();
        }
        return this;
    },
    deleteFeatures: function () {
        this.model.deleteFeatures();
    },
    removeIncompleteDrawing: function () {
        this.model.removeIncompleteDrawing();
    },
    unregisterListener: function () {
        this.model.unregisterPointerMoveListener(this.model);
        this.model.unregisterClickListener(this.model);
        Radio.trigger("Map", "removeInteraction", this.model.get("draw"));
    }
});

export default MeasureView;
