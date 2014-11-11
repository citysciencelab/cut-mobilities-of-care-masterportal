define([
    'underscore',
    'backbone',
    'models/MouseHoverPopup',
    'bootstrap'
], function (_, Backbone, MouseHoverPopup) {

    var MouseHoverPopupView = Backbone.View.extend({
        model: MouseHoverPopup,
        id: 'mousehoverpopup',
        events: {
            'click .tooltip-inner': 'destroy'
        },
        initialize: function () {
            this.listenTo(this.model, 'change:mhpcoordinates', this.render);
        },
        /**
        * Render merkt sich zunächst den neuen Wert newText, weil this.model mit this.destroy() zerstört wird.
        * Damit das Tooltip immer nach der eingestellten Zeit zerstört wird und nicht früher durch ein vorheriges
        * Tooltip, wird myTimeout abgespeichert und ggf. gelöscht mir clearTimeout.
        * Anschließend wird ein neues Tooltip zusammengestellt. html = true damit </br> korrekt erkannt bei cluster
        * erkannt werden
        */
        render: function (evt) {
            var newText = this.model.get('mhpresult');
            var myTimeout = this.model.get('mhptimeout');
            if (myTimeout) {
                clearTimeout(myTimeout);
                this.model.set('mhptimeout', '');
            }
            this.destroy(); //lösche alten Tooltip sofern vorhanden
            var attr = this.model.toJSON();

            $(this.model.get('element')).tooltip({
                'html': true,
                'title': newText,
                'placement': 'auto',
                'delay': { show: 500, hide: 100 }
            });
            this.model.showPopup();
            var that = this;
            var myTimeout = setTimeout(function(){
                that.destroy();
            }, 3000);
            this.model.set('mhptimeout', myTimeout) ;
        },
        destroy: function () {
            this.model.set('mhptimeout', '');
            this.model.destroyPopup();
        }
    });

    return MouseHoverPopupView;
});
