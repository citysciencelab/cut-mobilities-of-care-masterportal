define([
    'underscore',
    'backbone',
    'eventbus',
    'config'
], function (_, Backbone, EventBus, Config) {

    var Tools = Backbone.Model.extend({
        initialize: function () {
            _.each(Config.tools, this.setAttributes, this);
            this.listenTo(this, 'change:active', this.activateTool);
        },
        setAttributes: function (value, key) {
            this.set(key, value);
        },
        activateCoordinate: function () {
            this.set('active', 'coords');
        },
        activateMeasure: function () {
            this.set('active', 'measure');
        },
        activateGFI: function () {
            this.set('active', 'gfi');
        },
        activateTool: function () {
            EventBus.trigger('activateClick', this.get('active')); // für die Map
            if (this.get('active') === 'coords') {
                EventBus.trigger('togglePopup', true);
            }
            else if (this.get('active') === 'measure') {
                EventBus.trigger('togglePopup', false);
            }
            else if (this.get('active') === 'gfi') {
                EventBus.trigger('togglePopup', false);
            }
        }
    });

    return new Tools();
});