define(function (require) {

    var Button3dTemplate = require("text!modules/controls/button3d/template.html"),
        Button3dView;

    Button3dView = Backbone.View.extend({
        events: {
            "click .button3D": "mapChange"
        },
        initialize: function () {
            this.template = _.template(Button3dTemplate);
            this.render();
        },
        render: function () {
            this.$el.html(this.template);
            if (Radio.request("Map", "isMap3d")) {
                this.$("#button3D").addClass("toggleButtonPressed");
            }

            return this;
        },
        mapChange: function () {
            if (Radio.request("Map", "isMap3d")) {
                Radio.trigger("Map", "deactivateMap3d");
                this.$("#button3D").removeClass("toggleButtonPressed");
                Radio.trigger("Alert", "alert:remove");
            }
            else {
                Radio.trigger("Map", "activateMap3d");
                // Radio.trigger("ModelList", "setModelAttributesById", "3d_daten", {isExpanded: true});
                // Radio.trigger("ModelList", "setModelAttributesById", "terrain", {isSelected: true});
                this.$("#button3D").addClass("toggleButtonPressed");
                Radio.trigger("Alert", "alert", "Der 3D-Modus befindet sich zur Zeit noch in der Beta-Version!");
            }

        }
    });

    return Button3dView;
});
