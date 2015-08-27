define([
    "backbone",
    "text!modules/gfipopup/gfiObjects/img/template.html",
    "modules/gfipopup/gfiObjects/img/model"
], function (Backbone, ImgTemplate, ImgModel) {
    "use strict";
    var ImgView = Backbone.View.extend({
        template: _.template(ImgTemplate),
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        events: {
            "remove": "destroy"
        },

        initialize: function (url) {
            this.model = new ImgModel();
            this.model.set('url', url);
            this.render();
            this.listenTo(this.model, "change:reloadVersuch", this.checkReloadVersuch);
            this.model.set('zufallszahl', Math.floor(Math.random() * (20000 - 0 + 1)) + 0);
            this.model.checkImage();
        },
        /**
         *
         */
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },
        /**
         * Removed das Img-Objekt vollständig.
         * Wird beim destroy des GFI für alle Child-Objekte aufgerufen.
         */
        destroy: function () {
            this.unbind();
            this.model.destroy();
        },
        checkReloadVersuch: function () {
            if (this.model.get('reloadVersuch') > this.model.get('reloadMaxVersuche')) {
                this.remove();
            }
        }
    });

    return ImgView;
});
