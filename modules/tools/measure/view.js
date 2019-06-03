import DefaultTemplate from "text-loader!./default/template.html";
import TableTemplate from "text-loader!./table/template.html";
import SnippetDropdownView from "../../snippets/dropdown/view";
// import "bootstrap-select";

const MeasureView = Backbone.View.extend({
    events: {
        // "change select#geomField": "setGeometryType",
        // "change select#unitField": "setUnit",
        "click button.table-tool-measure-delete": "deleteFeatures",
        "click button.measure-delete": "deleteFeatures",
        // "changed.bs.select[data-id='geomField']": "setGeometryType",
        // "changed.bs.select[data-id='unitField']": "setUnit",
        "click .form-horizontal > .form-group-sm > .col-sm-12 > .glyphicon-question-sign": function () {
            Radio.trigger("Quickhelp", "showWindowHelp", "measure");
        }
        //"change select": "setGeometryType" //muss in model rein "listenTo....in Listener"
    },
    initialize: function () {
        this.listenTo(this.model, {
            // "change:isActive change:geomtype": this.render
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
    /**
     * inits the dropdown list
     * @see {@link http://silviomoreto.github.io/bootstrap-select/options/|Bootstrap-Select}
     * @returns {void}
     */
    // initDropdown: function () {
    //     this.$el.find(".form-control").selectpicker();
    // },
    setGeometryType: function (evt) {
        // this.model.get("drawInteraction").setActive(false);
        this.model.setGeometryType(evt.target.value);
        // this.model.createInteraction(evt.target.value);  // im Model rein?
    },
    setUnit: function (evt) {
        this.model.setUnit(evt.target.value);
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
