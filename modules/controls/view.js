define([
    "backbone",
    "backbone.radio"
], function (Backbone, Radio) {

    var ControlsView = Backbone.View.extend({
        className: "container-fluid controls-view",
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

            if (_.has(result, "STYLE")) {
                var value = _.values(_.pick(result, "STYLE"))[0].toUpperCase();

                if (value === "SIMPLE") {
                    this.$el.hide();
                }
            }
            else {
                $(".navbar").after(this.$el);
            }
        }
    });

    return ControlsView;
});
