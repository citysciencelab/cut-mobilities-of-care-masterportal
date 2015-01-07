define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Orientation.html',
    'models/Orientation',
    'config'
], function ($, _, Backbone, OrientationTemplate, Orientation,Config) {

    var OrientationView = Backbone.View.extend({
        model: Orientation,
        id:'toggleDiv',
        template: _.template(OrientationTemplate),
        events: {
            'click .buttonStandpunkt': 'getOrientation',
            'click .buttonPOI': 'getPOI'
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            //var attr = this.model.toJSON();
            //this.getOrientation();
            //$('#toggleRow').append(this.$el.html(this.template(attr)));
            var attr=Config;
            $('#toggleRow').append(this.$el.html(this.template(attr)));
        },
        getOrientation: function (){
            this.model.setOrientation("stdPkt");
        },
        getPOI: function (){
            $(function () {
                $('#loader').show();
            });
            this.model.setOrientation("poi");
        }
    });

    return OrientationView;
});
