define([
    'underscore',
    'backbone',
    'openlayers'
], function (_, Backbone, ol) {


    var Legend = Backbone.Model.extend({
        defaults:{
            img:[]
        },
        setAttributions: function(params){
            this.set('img', []);

            _.each(params, function(element, index) {
                name= element.name.replace(/ /g, "_");
                this.get('img').push("../../img/"+name+".png");
            },this);
        }


    });

    return new Legend();
});
