import AddWMSWin from "text-loader!./template.html";

const AddWMSView = Backbone.View.extend({
    events: {
        "click #addWMSButton": "loadAndAddLayers",
        "keydown": "keydown"
    },
    initialize: function () {
        if (!["custom", "default"].includes(Radio.request("Parser", "getTreeType"))) {
            console.error("The addWMS tool is currently only supported for the custom and default theme trees!");
            return;
        }

        this.listenTo(this.model, {
            "change:wmsURL": this.urlChange,
            "change:isActive": this.render
        });

        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },

    template: _.template(AddWMSWin),
    // Löst das laden und einfügen der Layer in den Baum aus
    loadAndAddLayers: function () {
        this.model.loadAndAddLayers();
    },
    // abschicken per Enter-Taste
    keydown: function (e) {
        const code = e.keyCode;

        if (code === 13) {
            this.loadAndAddLayers();
        }
    },
    // Rendert das Tool-Fenster
    render: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
        }
        return this;
    }
});

export default AddWMSView;
