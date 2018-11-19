// define(function (require) {

//     var ButtonObliqueTemplate = require("text-loader!./template.html"),
//         ButtonObliqueView;
import ButtonObliqueTemplate from "text-loader!./template.html";

const ButtonObliqueView = Backbone.View.extend({
    events: {
        "click .buttonOblique": "mapChange"
    },
    initialize: function () {
        var channel = Radio.channel("Map");

        channel.on({
            "change": this.change
        }, this);

        this.template = _.template(ButtonObliqueTemplate);
        this.render();
    },
    change: function (map) {
        if (map === "Oblique") {
            this.$("#buttonOblique").addClass("toggleButtonPressed");
        }
        else {
            this.$("#buttonOblique").removeClass("toggleButtonPressed");
        }
    },
    render: function () {
        this.$el.html(this.template);
        if (Radio.request("ObliqueMap", "isActive")) {
            this.change("Oblique");
        }

        return this;
    },
    mapChange: function () {
        if (Radio.request("ObliqueMap", "isActive")) {
            Radio.trigger("ObliqueMap", "deactivate");
            Radio.trigger("Alert", "alert:remove");
        }
        else {
            if (Radio.request("Map", "isMap3d")) {
                Radio.once("Map", "change", function (map) {
                    if (map === "2D") {
                        this.mapChange();
                    }
                }.bind(this));
                Radio.trigger("Map", "deactivateMap3d");
                return;
            }
            Radio.trigger("ObliqueMap", "activate");
            Radio.trigger("Alert", "alert", "Der Schrägluftbild-Modus befindet sich zur Zeit noch in der Beta-Version!");
        }

    }
});

export default ButtonObliqueView;
