define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/GFIPopup.html',
    'models/GFIPopup',
    'eventbus'
], function ($, _, Backbone, GFIPopupTemplate, GFIPopup, EventBus) {

    var GFIPopupView = Backbone.View.extend({
        model: GFIPopup,
        template: _.template(GFIPopupTemplate),
        events: {
            'click .closegfi': 'destroy',
            'click .pager-right': 'renderNext',
            'click .pager-left': 'renderPrevious'
        },
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        initialize: function () {
            this.listenTo(this.model, 'change:coordinate', this.render);
            EventBus.on('closeGFIParams', this.destroy, this); // trigger in map.js
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
            EventBus.trigger('GFIPopupVisibility', true);
        },
        /**
         *
         */
        renderNext: function () {
            if($('.pager-right').hasClass('disabled') === false) {
                this.model.set('gfiCounter', this.model.get('gfiCounter') - 1);
                this.render();
            }
        },
        /**
         *
         */
        renderPrevious: function () {
            if($('.pager-left').hasClass('disabled') === false) {
                this.model.set('gfiCounter', this.model.get('gfiCounter') + 1);
                this.render();
            }
        },
        /**
         *
         */
        destroy: function () {
            EventBus.trigger('GFIPopupVisibility', false);
            this.model.destroyPopup();
        }
    });

    return GFIPopupView;
});
