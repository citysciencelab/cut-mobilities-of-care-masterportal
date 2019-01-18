// define(function (require) {

//     var Button3dTemplate = require("text-loader!./template.html"),
//         Button3dView;
import Button3dTemplate from "text-loader!./template.html";

const Button3dView = Backbone.View.extend({
    events: {
        "click .button3D": "mapChange",
        "click div#3d-ansicht": "mapChange"
    },
    initialize: function () {
        var channel = Radio.channel("Map"),
            style = Radio.request("Util", "getUiStyle");

        channel.on({
            "change": this.change
        }, this);
        if (style === "DEFAULT") {
            this.template = _.template(Button3dTemplate);
            this.render();
        }
        else if (style === "TABLE") {
            this.listenTo(Radio.channel("MenuLoader"), {
                "ready": function () {
                    this.setElement("#table-tools-menu");
                    this.renderToToolbar();
                }
            });
            this.setElement("#table-tools-menu");
            this.renderToToolbar();
        }
    },
    tabletemplate: _.template("<div id='3d-ansicht' class='table-tool'><a href='#'><span class='glyphicon icon-btn3d1'></span><span id='3d_titel'><%=ansicht %></span></a> </div>"),
    change: function (map) {
        if (map === "3D") {
            this.$("#button3D").addClass("toggleButtonPressed");
        }
        else {
            this.$("#button3D").removeClass("toggleButtonPressed");
        }
    },
    render: function () {
        this.$el.html(this.template);
        if (Radio.request("Map", "isMap3d")) {
            this.$("#button3D").addClass("toggleButtonPressed");
        }

        return this;
    },
    renderToToolbar: function () {
        this.$el.append(this.tabletemplate({ansicht: "Ansicht einschalten"}));
        if (Radio.request("Map", "isMap3d")) {
            this.$("#3d-ansicht").addClass("toggleButtonPressed");
        }

        return this;
    },
    mapChange: function () {

        if (Radio.request("Map", "isMap3d")) {
            Radio.trigger("ModelList", "toggleWfsCluster", true);
            Radio.trigger("Map", "deactivateMap3d");
            Radio.trigger("Alert", "alert:remove");
            this.$("#3d_titel").text("Auswahl einschalten");
        }
        else {
            if (Radio.request("ObliqueMap", "isActive")) {
                Radio.once("Map", "change", function (map) {
                    if (map === "2D") {
                        this.mapChange();
                    }
                }.bind(this));
                Radio.trigger("ObliqueMap", "deactivate");
                return;
            }
            this.$("#3d_titel").text("Auswahl ausschalten");
            Radio.trigger("ModelList", "toggleWfsCluster", false);
            Radio.trigger("Map", "activateMap3d");
            // Radio.trigger("ModelList", "setModelAttributesById", "3d_daten", {isExpanded: true});
            // Radio.trigger("ModelList", "setModelAttributesById", "terrain", {isSelected: true});
            Radio.trigger("Alert", "alert", "Der 3D-Modus befindet sich zur Zeit noch in der Beta-Version!");
        }

    }
});

export default Button3dView;
