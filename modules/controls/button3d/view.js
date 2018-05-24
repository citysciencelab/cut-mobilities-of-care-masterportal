define(function (require) {

    var Button3dTemplate = require("text!modules/controls/button3d/template.html"),
        $ = require("jquery"),
        Button3dView;

    Button3dView = Backbone.View.extend({
        className: "row",
        template: _.template(Button3dTemplate),
        events: {
            "click .glyphicon-globe": "mapChange"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(this.template);
            if (Radio.request("Map", "isMap3d")) {
                $("#button3D").addClass("toggleButtonPressed");
            }
        },
        mapChange: function () {
            if (Radio.request("Map", "isMap3d")) {
                Radio.trigger("Map", "deactivateMap3d");
                $("#button3D").removeClass("toggleButtonPressed");
            }
            else {
                Radio.trigger("Map", "activateMap3d");
                // Radio.trigger("ModelList", "setModelAttributesById", "3d_daten", {isExpanded: true});
                // Radio.trigger("ModelList", "setModelAttributesById", "terrain", {isSelected: true});
                $("#button3D").addClass("toggleButtonPressed");
            }

        }
    });

    return Button3dView;
});
