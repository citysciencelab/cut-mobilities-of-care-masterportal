define([
    'underscore',
    'backbone',
    'models/MouseHoverPopup',
    'bootstrap'
], function (_, Backbone, MouseHoverPopup) {

    var MouseHoverPopupView = Backbone.View.extend({
        model: MouseHoverPopup,
        id: 'mousehoverpopup',
        initialize: function () {
            this.listenTo(this.model, 'change:mhpresult', this.render);
        },
        /**
        * Render merkt sich zunächst den neuen Wert newText, weil this.model mit this.destroy() zerstört wird.
        * Damit das Tooltip immer nach der eingestellten Zeit zerstört wird und nicht früher durch ein vorheriges
        * Tooltip, wird myTimeout abgespeichert und ggf. gelöscht mir clearTimeout.
        * Anschließend wird ein neues Tooltip zusammengestellt. html = true damit </br> korrekt erkannt bei cluster
        * erkannt werden
        */
        render: function (evt) {
            var oldSelection = this.model.get('oldSelection');
            var newSelection = this.model.get('newSelection');
            var newText = this.model.get('mhpresult');
            if (oldSelection != ''){
                var result = this.destroy(); //lösche alten Tooltip sofern vorhanden
            }
            var attr = this.model.toJSON();
            $(this.model.get('element')).tooltip({
                'html': true,
                'title': newText,
                'placement': 'auto',
                'delay': { show: 100, hide: 100 },
                'template' : '<div class="tooltip" role="tooltip"><div class="tooltip-inner mouseHover"></div></div>'
            });
            this.model.showPopup();
            var that = this;
//            var myTimeout = setTimeout(function(){
//                that.destroy();
//            }, 3000);
//            this.model.set('mhptimeout', myTimeout) ;
            this.model.set('oldSelection', newSelection);
        },
        destroy: function () {
            var myTimeout = this.model.get('mhptimeout');
            if (myTimeout != '') {
                clearTimeout(myTimeout);
                this.model.set('mhptimeout', '');
            }
            this.model.set('oldSelection', '');
            this.model.destroyPopup();
            return true;
        }
    });

    return MouseHoverPopupView;
});
