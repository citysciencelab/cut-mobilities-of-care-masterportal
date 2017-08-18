define(function (require) {

    var SliderModel;

    SliderModel = Backbone.Model.extend({
        defaults: {
            min: 0,
            max: 20,
            step: 1,
            value: 2
        },
        initialize: function () {

        }
    });

    return SliderModel;
});
