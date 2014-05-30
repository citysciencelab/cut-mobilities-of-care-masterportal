define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/GFIPopup.html',
    'models/GFIPopup'
], function ($, _, Backbone, GFIPopupTemplate, GFIPopup) {

    var GFIPopupView = Backbone.View.extend({
        model: GFIPopup,
        template: _.template(GFIPopupTemplate),
        events: {
            'click .close': 'destroy',
            'click .next': 'renderNext',
            'click .previous': 'renderPrevious'
        },
        /**
         *
         */
        initialize: function () {
            this.registerListener();
        },
        /**
         *
         */
        registerListener: function () {
            this.listenTo(this.model, 'change:coordinate', this.render);
            this.listenTo(this.model, 'change:gfiCounter', this.render);
        },
        /**
         *
         */
        render: function (evt) {
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
        },
        /**
         *
         */
        renderPrevious: function () {
            this.model.set('gfiCounter', this.model.get('gfiCounter') - 1);
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