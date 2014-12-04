define([
    'backbone',
    'eventbus'
], function (Backbone, EventBus) {

    var aktualisiereVerkehrsdaten = Backbone.Model.extend({
        initialize: function () {
            EventBus.on('simple', this.setEventValue, this);
        },
        setEventValue: function (attributions, layer) {
            if (!layer) {
                return
            }
            var d = new Date();
            var value = String(d.getTime());
            layer.set('eventValue', value);
        }
    });
    return aktualisiereVerkehrsdaten;
});
