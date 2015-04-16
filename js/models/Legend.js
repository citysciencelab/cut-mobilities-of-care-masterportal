define([
    'underscore',
    'backbone',
    'openlayers',
    'config',
    'collections/stylelist',
    'collections/LayerList'
], function (_, Backbone, ol, Config, StyleList, Layerlist) {



    var Legend = Backbone.Model.extend({
        defaults:{
            legendArray:[],
            visibLegend:'',
            layerid:[],
            layername:[],
            stylename:[],
            img:[],
            typ:'',
            scrollHeight:'',
            params:'',
            grouplayer:[]

        },
        initialize: function (){
            this.set('layerlist',Layerlist.getAllLayer());
        },
        setAttributions: function(){
                this.set('legendArray', []);
                _.each(this.get('params'), function(element, index) {
                    this.set('img', []);
                    this.set('layername',[]);
                    this.set('layerid',[]);
                    this.set('stylename',[]);
                    this.set('grouplayer',[]);
                    if(element.typ=='WMS'){
                        layers =element.layers.split(',');
                        this.get('layerid').push(element.layerID);
                        this.set('typ',element.typ);
                        if(element.legendURL!='ignore'&&layers.length==1){
                            this.get('layername').push(element.name);
                            if(element.legendURL===""||!element.legendURL){
                                var url=element.source+'?VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER='+element.layers;
                                this.get('img').push(url);
                            }
                            else{
                                if( element.legendURL&&!element.styles){
                                    var url=element.legendURL;
                                }
                                else{
                                    var url=element.legendURL[element.styles];
                                }
                                this.get('img').push(url);
                            }
                        }
                        else if(element.legendURL!='ignore'&&layers.length>1){
                            this.get('layername').push(element.name);
                            var url=[];
                            if(element.legendURL){
                                url.push(element.legendURL);
                            }
                            else{
                                _.each(layers, function(layersgroup, layersindex){
                                    url.push(element.source+'?Version=1.1.1&SERVICE=WMS&Request=GetLegendGraphic&Format=image/png&Layer='+layers[layersindex]);
                                },this);
                            }
                            this.set('img',url);
                        }
                    }
                    else if (element.typ==='GROUP'){
                        this.get('layername').push(element.name);
                        this.get('grouplayer').push(element.layerID);
                        var url=[], grouplayerid=[];
                        _.each(element.layers, function(groupelement, groupindex){
                            this.set('typ',groupelement.typ);
                            if(groupelement.legendURL!="ignore"&&groupelement.legendURL!=""&&groupelement.legendURL!=undefined&&groupelement.styles===undefined){
                                grouplayerid.push(groupelement.legendURL);
                                url.push(groupelement.legendURL);
                            }
                            else if (groupelement.legendURL!="ignore"&&groupelement.styles===undefined){
                                grouplayerid.push(groupelement.layerID);
                                url.push(groupelement.source+'?Version=1.1.1&Request=GetLegendGraphic&Format=image/png&Layer='+groupelement.layers);
                            }
                            else if (groupelement.styles!=undefined){
                                grouplayerid[0]=groupelement.layerID;
                                url[0]=groupelement.legendURL[groupelement.styles];
                            }
                        },this);
                        this.get('layerid').push(grouplayerid);
                        this.set('img',url);

                    }
                    else if (element.typ=='WFS'){
                        this.get('layerid').push(element.layerID);
                        this.set('typ',element.typ);
                        this.get('layername').push(element.name);
                        var typ='';
                        if(element.styleField){
                            var style=[], stylename=[];
                            _.find(StyleList.models, function(list){
                                if(element.legendURL!="ignore"&&element.legendURL!=""&&element.legendURL!=undefined){
                                    if(list.attributes.layerId===element.layerID){
                                        //||list.attributes.layerId===element.layerID+'_cluster'
                                    style[0]=element.legendURL;
                                    stylename[0]=element.name;
                                    typ='WFS_pic';
                                    }
                                }
                                else{
                                    if(list.attributes.layerId===element.layerID){
                                        //||list.attributes.layerId===element.layerID+'_cluster'
                                    style.push(list.get('imagepath')+list.get('imagename'));
                                    stylename.push(list.get('styleFieldValue'));
                                    }
                                    else if(list.attributes.layerId===element.layerID+'_cluster'){
                                        var circlefillcolor=list.get('circlefillcolor')
                                        if(circlefillcolor instanceof Object){
                                        }
                                        else{
                                            circlefillcolor=circlefillcolor.slice(1).split(",");
                                            circlefillcolor=circlefillcolor[0]+','+circlefillcolor[1]+','+circlefillcolor[2];
                                            circlefillcolor=circlefillcolor.replace(/\s+/g, '');
                                            style.push({"clusterstrokecolor":list.get('clusterstrokecolor'),"circlefillcolor":circlefillcolor});
                                            stylename.push('Clustersymbol');
                                        }
                                    }
                                }
                            });
                            this.set('img',style);
                            this.set('stylename',stylename);
                        }
                        else{
                            if(element.legendURL!="ignore"&&element.legendURL!=""&&element.legendURL!=undefined){
                                var style=element.legendURL;
                                this.get('img').push(style);
                                this.get('stylename').push(element.name);
                                typ='WFS_pic';
                            }
                            else{
                                var style=StyleList.returnModelById(element.layerID).get('imagepath')+StyleList.returnModelById(element.layerID).get('imagename');
                                this.get('img').push(style);
                                this.get('stylename').push(element.name);
                            }
                        }
                        if(typ!=''){
                            this.set('typ', typ);
                        }
                    }
                    if(this.get('layername')!=undefined&&element.legendURL!='ignore'){
                        this.get('legendArray').push({
                            name:this.get('layername'),
                            img:this.get('img'),
                            layerid:this.get('layerid'),
                            style:'',
                            stylename:this.get('stylename'),
                            typ:this.get('typ'),
                            grouplayer: this.get('grouplayer')
                        });
                    }
                },this);
                this.get('legendArray').reverse();

        }

    });

    return new Legend();
});
