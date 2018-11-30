/**
 * @description Dieses Model beinhaltet die Logik, um einen WMS Capabillity Request auszuführen und die Response zu parsen.
 * Aus dem geparseten Objekt werden die Layer ausgelesen und aus diesen Informationen Layerobjekte erzeugt und an die Collection,
 * die die Layer verwaltet geschickt
 * @module AddWMSView
 * @extends Backbone.View
 */
import AddWMSWin from "text-loader!./template.html";

const AddWMSView = Backbone.View.extend({
    events: {
        "click #addWMSButton": "loadAndAddLayers",
        "keydown": "keydown"
    },
    initialize: function () {
        // Tool ist nur für treeType: custom verfügbar
        if (Radio.request("Parser", "getTreeType") !== "custom") {
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
        var code = e.keyCode;

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
