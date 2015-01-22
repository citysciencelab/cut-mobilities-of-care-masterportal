define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Legend.html',
    'models/Legend',
    'eventbus'
], function ($, _, Backbone, LegendTemplate, Legend, EventBus) {

    var LegendView = Backbone.View.extend({
        model: Legend,
        id: 'base-modal-legend',
        className: 'modal bs-example-modal-sm legend',
        template: _.template(LegendTemplate),
        initialize: function () {
            this.getVisibleLayer();
            this.render();
            EventBus.on('toggleLegendWin', this.toggleLegendWin, this);
            EventBus.on('changeView', this.changeView, this);
            EventBus.on('setMap', this.setMap, this);
            EventBus.trigger('getMap', this);

            //EventBus.on('sendAllVisibleLayer', this.getVisibleLayer, this);
            EventBus.on('aftercollapse', this.aftercollapse, this);
            $(document.body).on('hide.bs.modal', '#base-modal-legend', this, function(evt) {
                EventBus.trigger('changeView', this);
            });

        },
        events: {
            "click .list-group-item.type": "collapseHits"
        },
        show: function (params) {
            this.render();
            this.$el.modal({
                backdrop: true,
                show: true
            });
            this.model.set('visibLegend', '');
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },

        getAllVisibleLayer: function () {
            var visibleLayer=[];
            _.each(this.model.get('layerlist'), function(element){
                 visibleLayer.push(element);
            });
            return visibleLayer;
        },
        getVisibleLayer: function(evt){

            layers = this.getAllVisibleLayer();
            var legendParams=[], groupArray=[],layeridarray=[];

            _.each(layers, function (element) {
                if (element.get('typ') === 'WFS') {
                    layeridarray.push(element.get('id'));

                    legendParams.push({
                        typ: 'WFS',
                        layerID:element.get('id'),
                        source: element.get('url'),
                        name: element.get('name'),

                        styleField: element.get('styleField'),
                        legendURL: element.get('legendURL'),
                    });
                }
                else if (element.get('typ') === 'WMS') {
                    layeridarray.push(element.get('id'));

                    legendParams.push({
                        typ:'WMS',
                        layerID:element.get('id'),
                        source:element.get('url'),
                        name: element.get('name'),
                        legendURL: element.get('legendURL'),

                        layers: element.get('layers'),
                        styles:element.get('styles')

                    })
                }
                else if (element.get('typ') === 'GROUP') {
                    groupArray=[];
                    _.each(element.get('layer').values_.layers.array_, function (layerarray, indexarray){

                        layeridarray.push(layerarray.id);

                        groupArray.push({
                            typ:'GROUP',
                            layerID:layerarray.id,
                            source:layerarray.source_.urls_[0],
                            name: layerarray.get('name'),
                            legendURL: layerarray.values_.legendURL,

                            layers: layerarray.source_.params_.LAYERS,
                            styles:layerarray.source_.params_.STYLES

                        });
                    })
                    legendParams.push({
                        typ:'GROUP',

                        layerID:element.get('id'),

                        name: element.get('name'),
                        layers:groupArray})
                }
            });

            this.model.set('layeridArray',layeridarray);
            this.model.set('params',legendParams);
            this.model.setAttributions();

        },
        toggleLegendWin: function (){
            if(this.model.get('visibLegend')===''){
                EventBus.trigger('getAllVisibleLayer', this);
            }
            this.show();
        },
        setMap: function (map) {
            this.model.set('map', map);
        },
        "collapseHits": function (evt) {
            $(".list-group-item.type + div").hide("fast");  // schließt alle Reiter
            if ($(evt.currentTarget.nextElementSibling).css("display") === "block") {
                $(evt.currentTarget.nextElementSibling).hide("fast");
            }
            else {
                var legendObject={
                    layernameLi:$(evt.currentTarget).height(),
                    heightDIVLi:$(evt.currentTarget.nextElementSibling.children),


                    legendDIVLiListLength:$(evt.currentTarget.parentNode).children('li').length,
                    currentTargetLi:evt.currentTarget.nextElementSibling.nextElementSibling.innerHTML*1,
                    maxHeightLegendDIV:$(evt.currentTarget.parentNode).css("max-height").split('p')[0]*1
                }
                $.when( $(evt.currentTarget.nextElementSibling).show("fast") ).then(function(){
                    EventBus.trigger('aftercollapse',legendObject);
                });
            }
        },
        aftercollapse: function (legendObject){
            var heightlegendbody=$('#legendbody').css("height").split('p')[0]*1;
            _.each($('.legenddiv'), function(element, index){
                element.style.maxHeight=(legendObject.maxHeightLegendDIV-(8*legendObject.layernameLi))+"px";
            });

            if(legendObject.currentTargetLi+1===legendObject.legendDIVLiListLength){
                this.model.set('scrollHeight',heightlegendbody);
            }
            else{
            this.model.set('scrollHeight',(legendObject.layernameLi*legendObject.currentTargetLi)/(heightlegendbody/(heightlegendbody+$(legendObject.heightDIVLi[0]).css('height').split('p')[0]*1)));
            }
            $('#legendbody').scrollTop(this.model.get('scrollHeight'));

        },
        changeView: function(){
            this.model.set('visibLegend', $('.legendbody img:visible'));
        }
    });

    return LegendView;
});

