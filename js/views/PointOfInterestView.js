define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/PointOfInterest.html',
    'models/PointOfInterest'
], function ($, _, Backbone, PointOfInterestTemplate, PointOfInterest) {

    var PointOfInterestView = Backbone.View.extend({
        model: PointOfInterest,
        template: _.template(PointOfInterestTemplate),
        events: {
            'click': 'getPointOfInterest'
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();
            //$('body').append(this.$el.append(this.template(attr)));
            $('#toggleRow').append(this.$el.html(this.template(attr)));
        },
        getPointOfInterest: function (){
            this.model.setPointOfInterest();
        }
    });

    return PointOfInterestView;
});
