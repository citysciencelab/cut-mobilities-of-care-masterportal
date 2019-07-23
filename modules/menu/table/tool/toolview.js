import ToolTemplate from "text-loader!./tooltemplate.html";

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
        var attr = this.model.toJSON();

        $("#table-tools-menu").append(this.$el.html(this.template(attr)));

        return this;
    },
    checkItem: function () {
        if (this.model.get("name") === "legend") {
            Radio.trigger("Legend", "toggleLegendWin");
        }
        else {
            this.model.setIsActive(true);
        }
    },
    /**
     * @todo Write the documentation.
     * @param {String} mode Flag of the view mode
     * @returns {void}
     */
    toggleSupportedVisibility: function (mode) {
        var toolsFor3D = this.model.get("supportedIn3d").concat(this.model.get("supportedOnlyIn3d"));

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
