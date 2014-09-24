define([
    'jquery',
    'underscore',
    'backbone',
    'eventbus',
    'text!templates/GFIPopup.html',
    'models/GFIPopup'
], function ($, _, Backbone, EventBus, GFIPopupTemplate, GFIPopup) {

    var GFIPopupView = Backbone.View.extend({
        model: GFIPopup,
        template: _.template(GFIPopupTemplate),
        events: {
            'click .close': 'destroy',
            'click .next': 'renderNext',
            'click .previous': 'renderPrevious'
        },
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        initialize: function () {
            this.listenTo(this.model, 'change:coordinate', this.render);
            //this.listenTo(this.model, 'change', this.render);
            EventBus.on('render', this.render, this);
        },
        /**
         *
         */
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
            $(this.model.get('element')).popover({
                'placement': 'auto',
                'html': true,
                'content': this.$el
            });
            this.model.showPopup();
        },
        /**
         *
         */
        renderNext: function () {
            this.model.set('gfiCounter', this.model.get('gfiCounter') + 1);
            this.render();
        },
        /**
         *
         */
        renderPrevious: function () {
            this.model.set('gfiCounter', this.model.get('gfiCounter') - 1);
            this.render();
        },
        /**
         *
         */
        destroy: function () {
            this.model.destroyPopup();
        }
    });

    return GFIPopupView;
});
