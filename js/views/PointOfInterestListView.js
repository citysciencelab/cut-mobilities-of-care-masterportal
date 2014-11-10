define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/PointOfInterestList.html',
    'collections/PointOfInterestList',
    'views/PointOfInterestView',
    'eventbus'
], function ($, _, Backbone, PointOfInterestListTemplate, PointOfInterestList, PointOfInterestView, EventBus) {

    var PointOfInterestListView = Backbone.View.extend({
        collection: PointOfInterestList,
        id: 'base-modal',
        className: 'modal fade in',
        template: _.template(PointOfInterestListTemplate),
        events: {
            'click .close, button': 'removeAllModels'
        },
        initialize: function () {
            EventBus.on('showPOIModal', this.show, this);
            this.listenTo(this.collection, 'add', this.addOne);
            this.render();
        },
        render: function () {
            this.$el.html(this.template());
        },
        addOne: function (model) {
            var poiView = new PointOfInterestView({model: model});
            this.$('table').append(poiView.render().el);
        },
        removeAllModels: function () {
            this.collection.removeAllModels();
            this.render();
        },
        show: function () {
            this.$el.modal({
                backdrop: 'static',
                show: true
            });
        }
    });

    return PointOfInterestListView;
});
