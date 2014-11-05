define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Orientation.html',
    'models/Orientation'
], function ($, _, Backbone, OrientationTemplate, Orientation) {

    var OrientationView = Backbone.View.extend({
        model: Orientation,
        template: _.template(OrientationTemplate),
        events: {
            'click': 'getOrientation'
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();
            //$('body').append(this.$el.append(this.template(attr)));
            $('#toggleRow').append(this.$el.html(this.template(attr)));
        },
        getOrientation: function (){
            this.model.setOrientation();
        }
    });

    return OrientationView;
});
