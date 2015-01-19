define([
    'underscore',
    'backbone',
    'openlayers',
    'config',
    'collections/stylelist'
], function (_, Backbone, ol, Config, StyleList) {


    var Legend = Backbone.Model.extend({
        defaults:{
            legendArray:[],
            visibLegend:'',
            layerid:[],
            layername:[],
            stylename:[],
            img:[],
            typ:''
        },
        setAttributions: function(params){

            this.set('legendArray', []);
            _.each(params, function(element, index) {
                this.set('img', []);
                this.set('layername',[]);
                this.set('layerid',[]);
                this.set('stylename',[]);
                if(element.typ=='WMS'){
                    layers =element.layers.split(',');
                    this.get('layerid').push(element.layerID);
                    this.set('typ',element.typ);
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
                        this.set('img',url);
                    }
                }
                else if (element.typ==='GROUP'){
                    this.get('layername').push(element.name);
                    var url=[], grouplayerid=[];
                    _.each(element.layers, function(groupelement, groupindex){
                        this.set('typ',groupelement.typ);
                        if(groupelement.legendURL!="ignore"&&groupelement.legendURL!=""&&!groupelement.legendURL&&groupelement.legendURL!=undefined){
                            grouplayerid.push(groupelement.layerID);
                            url.push(groupelement.legendURL);
                        }
                        else{
                            grouplayerid.push(groupelement.layerID);
                            url.push(groupelement.source+'?Version=1.1.1&Request=GetLegendGraphic&Format=image/png&Layer='+groupelement.layers);
                        }
                    },this);
                    this.get('layerid').push(grouplayerid);
                    this.set('img',url);

                }
                else if (element.typ=='WFS'){
                    this.get('layerid').push(element.layerID);
                    this.set('typ',element.typ);
                    this.get('layername').push(element.name);
                    if(element.styleField){
                        var style=[], stylename=[];
                        _.find(StyleList.models, function(list){
                            if(list.attributes.layerId===element.layerID){
                                //||list.attributes.layerId===element.layerID+'_cluster'

                            style.push(list.get('imagepath')+list.get('imagename'));
                            stylename.push(list.get('styleFieldValue'));
                            }
                        });
                        this.set('img',style);
                        this.set('stylename',stylename);
                    }
                    else{
                        var style=StyleList.returnModelById(element.layerID).get('imagepath')+StyleList.returnModelById(element.layerID).get('imagename');
                        this.get('img').push(style);
                        this.get('stylename').push(element.name);
                    }
                    //var name= element.name.replace(/ /g, "_");
                    //this.get('img').push("http://wscd0096/master_cv/img/"+name+".png");
                }
                if(this.get('layername')!=undefined&&element.legendURL!='ignore'){
                    this.get('legendArray').push({
                        name:this.get('layername'),
                        img:this.get('img'),
                        layerid:this.get('layerid'),
                        style:'',
                        stylename:this.get('stylename'),
                        typ:this.get('typ')
                    });
                }
            },this);
        }

    });

    return new Legend();
});
