define([
    "backbone",
    "backbone.radio",
    "text!modules/controls/button3d/template.html"
], function (Backbone, Radio, Button3dTemplate) {

    var Button3dView = Backbone.View.extend({
        className: "row",
        template: _.template(Button3dTemplate),
        events: {
            "click .glyphicon-globe": "mapChange",
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(this.template);
        },
        mapChange: function () {
            if(Radio.request("Map", "isMap3d")){
                Radio.trigger("Map", "deactivateMap3d");
            }else{
                Radio.trigger("Map", "activateMap3d");
            }

        }
    });

    return Button3dView;
});
