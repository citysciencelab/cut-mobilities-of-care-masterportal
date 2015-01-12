define([
    'underscore',
    'backbone',
    'openlayers',
    'config'
], function (_, Backbone, ol, Config) {


    var Legend = Backbone.Model.extend({
        defaults:{
            img:[]
        },
        setAttributions: function(params){
            this.set('img', []);

            _.each(params, function(element, index) {
                if(element.typ=='WMS'){
                    $.ajax({
                        url:Config.proxyURL,
                        data:{url:element.source.urls_+'?Service=WMS&Version=1.1.1&Request=GetLegendGraphic&Format=image/png&Layer='+element.source.params_.LAYERS},
                        async: false,
                        type: "GET",
                        success: function (data){
                            console.log(data);
                        }
                    })
                }
                else if (element.typ=='WFS'){
                    var name= element.name.replace(/ /g, "_");
                    this.get('img').push("../../img/"+name+".png");
                    console.log(this.get('img'));
                }
            },this);
        }


    });

    return new Legend();
});
