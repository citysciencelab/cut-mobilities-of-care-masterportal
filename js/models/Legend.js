define([
    'underscore',
    'backbone',
    'openlayers',
    'config'
], function (_, Backbone, ol, Config) {


    var Legend = Backbone.Model.extend({
        defaults:{
            visibLegend:'',
            layername:[],
            img:[]
        },
        setAttributions: function(params){
            this.set('img', []);
            this.set('layername',[]);
            _.each(params, function(element, index) {
                if(element.typ=='WMS'){
                    layers =element.layers.split(',');

                    if(element.legendURL!='ignore'&&layers.length==1){

                            this.get('layername').push(element.name);
                        if(element.legendURL===""||!element.legendURL){
                            var url=element.source+'?Version=1.1.1&Request=GetLegendGraphic&Format=image/png&Layer='+element.layers;
                            this.get('img').push(url);
                        }
                        else{
                            var url=element.legendURL;
                            this.get('img').push(url);
                        }
                    }
                    else if(element.legendURL!='ignore'&&layers.length>1){
                        this.get('layername').push(element.name);
                        var url=[];
                        _.each(layers, function(layersgroup, layersindex){
                            url.push(element.source+'?Version=1.1.1&Request=GetLegendGraphic&Format=image/png&Layer='+layers[layersindex]);
                        },this);
                        this.get('img').push(url);
                    }
                }
                else if (element.typ==='GROUP'){
                    this.get('layername').push(element.name);
                    var url=[];
                    _.each(element.layers, function(groupelement, groupindex){
                        if(groupelement.legendURL!="ignore"&&(groupelement.legendURL!=""||!groupelement.legendURL)){
                            url.push(groupelement.legendURL);
                        }
                        else{
                            url.push(groupelement.source+'?Version=1.1.1&Request=GetLegendGraphic&Format=image/png&Layer='+groupelement.layers);
                        }
                    },this);
                    this.get('img').push(url);

                }
                else if (element.typ=='WFS'){
                    this.get('layername').push(element.name);
                    var name= element.name.replace(/ /g, "_");
                    this.get('img').push("http://wscd0096/master_cv/img/"+name+".png");
                }
            },this);
        }


    });

    return new Legend();
});
