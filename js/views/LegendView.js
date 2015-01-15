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
            this.render();
            EventBus.on('toggleLegendWin', this.toggleLegendWin, this);
            EventBus.on('changeView', this.changeView, this);
            EventBus.on('setMap', this.setMap, this);
            EventBus.trigger('getMap', this);
            EventBus.on('sendAllVisibleLayer', this.getVisibleLayer, this);
            EventBus.on('aftercollapse', this.aftercollapse, this);
            $(document.body).on('hide.bs.modal', '#base-modal-legend', this, function(evt) {
                EventBus.trigger('changeView', this);

            })
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
        getVisibleLayer: function(evt){
            layers = evt.reverse();
            var legendParams=[], groupArray=[];

            _.each(layers, function (element) {
                if (element.get('typ') === 'WFS') {
                    legendParams.push({
                        typ: 'WFS',
                        layerID:element.id,
                        source: element.get('url'),
                        name: element.get('name')
                    });
                }
                else if (element.get('typ') === 'WMS') {
                    legendParams.push({
                        typ:'WMS',
                        source:element.get('url'),
                        name: element.get('name'),
                        legendURL: element.get('legendURL'),
                        layers: element.get('layers')
                    })
                }
                else if (element.get('typ') === 'GROUP') {
                    _.each(element.get('layer').values_.layers.array_, function (layerarray, indexarray){
                        groupArray.push({
                            typ:'GROUP',
                            source:layerarray.source_.urls_[0],
                            name: layerarray.get('name'),
                            legendURL: layerarray.values_.legendURL,
                            layers: layerarray.source_.params_.LAYERS
                        });
                    })
                    legendParams.push({
                        typ:'GROUP',
                        name: element.get('name'),
                        layers:groupArray})
                }
            });

            this.model.setAttributions(legendParams);
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
                    //maxHeightDIVLayer:$(evt.currentTarget.nextElementSibling).css("max-height").split('p')[0]*1,
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
            var scrollHeigh
            if(legendObject.currentTargetLi+1===legendObject.legendDIVLiListLength){
                scrollHeight=heightlegendbody;
            }
            else{
            scrollHeight=(legendObject.layernameLi*legendObject.currentTargetLi)/(heightlegendbody/(heightlegendbody+$(legendObject.heightDIVLi[0]).css('height').split('p')[0]*1));
            }
            $('#legendbody').scrollTop(scrollHeight);
        },
        changeView: function(){
            this.model.set('visibLegend', $('.legendbody img:visible'));
        }
    });

    return LegendView;
});

