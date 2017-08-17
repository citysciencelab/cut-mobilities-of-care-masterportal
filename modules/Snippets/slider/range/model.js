define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        SliderRangeModel;

    SliderRangeModel = Backbone.Model.extend({
        defaults: {
            min: 4,
            max: 50
        },
        initialize: function () {
            // var channel = Radio.channel("Model");
        }
    });

    return SliderRangeModel;
});
