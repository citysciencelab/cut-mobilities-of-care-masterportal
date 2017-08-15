define([
    "backbone",
    "backbone.radio"
], function (Backbone, Radio) {

    var ControlsView = Backbone.View.extend({
        className: "controls-view",
        initialize: function () {
            this.render();

            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        },
        render: function () {
            var result = Radio.request("ParametricURL", "getResult");
            if (!_.has(result, "STYLE") || _.values(_.pick(result, "STYLE"))[0].toUpperCase() !== "SIMPLE") {
                $("#map .ol-overlaycontainer-stopevent").append(this.$el);
            }
        },
        addRow: function (id) {
            this.$el.append("<div class='row' id='" + id + "'></div>");
            return this.$el.children().last();
        }
    });

    return ControlsView;
});
