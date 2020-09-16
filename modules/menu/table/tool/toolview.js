import ToolTemplate from "text-loader!./tooltemplate.html";
import store from "../../../../src/app-store/index";

const ToolView = Backbone.View.extend({
    events: {
        "click": "checkItem"
    },
    initialize: function () {
        this.listenTo(Radio.channel("Map"), {
            "change": function (mode) {
                this.toggleSupportedVisibility(mode);
            }
        });

        this.render();
        this.toggleSupportedVisibility(Radio.request("Map", "getMapMode"));
    },
    id: "table-tool",
    className: "table-tool",
    template: _.template(ToolTemplate),
    render: function () {
        const attr = this.model.toJSON();

        $("#table-tools-menu").append(this.$el.html(this.template(attr)));

        return this;
    },
    checkItem: function () {
        if (this.model.get("name") === "legend") {
            Radio.trigger("Legend", "toggleLegendWin");
        }
        else {
            if (!this.model.collection) {
                // addons are initialized with 'new Tool(attrs, options);' Then the model is replaced after importing the addon.
                // In that case 'this.model' of this class has not full content, e.g. collection is undefined --> replace it by the new model in the list
                this.model = Radio.request("ModelList", "getModelByAttributes", {id: this.model.id});
            }
            Radio.trigger("ModelList", "setActiveToolsToFalse", this.model);
            this.model.setIsActive(true);
            store.dispatch("Tools/setToolActive", {id: this.model.id, active: true});
        }
    },
    /**
     * @todo Write the documentation.
     * @param {String} mode Flag of the view mode
     * @returns {void}
     */
    toggleSupportedVisibility: function (mode) {
        const toolsFor3D = this.model.get("supportedIn3d").concat(this.model.get("supportedOnlyIn3d"));

        if (mode === "2D" && this.model.get("supportedOnlyIn3d").indexOf(this.model.get("id")) < 0) {
            this.$el.show();
        }
        else if (mode === "3D" && toolsFor3D.indexOf(this.model.get("id")) >= 0) {
            this.$el.show();
        }
        else if (mode === "Oblique" && this.model.get("supportedInOblique").indexOf(this.model.get("id")) >= 0) {
            this.$el.show();
        }
        else {
            this.$el.hide();
        }
    }
});

export default ToolView;
