define([
    "backbone",
    "eventbus",
    "underscore",
    "config"
], function (Backbone, EventBus, _, Config) {

    var ImgModel = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
            id: '',
            zufallszahl: '',
            url: '',
            gfiImgReloadTime: 0
        },
        /**
         *
         */
        initialize: function () {
            this.set('id', _.uniqueId("img"));
            this.set('zufallszahl', Math.floor(Math.random() * (20000 - 0 + 1)) + 0);
            if (Config.gfiImgReloadTime && Config.gfiImgReloadTime > 0) {
                var that = this;
                this.set('gfiImgReloadTime', Config.gfiImgReloadTime);
                setInterval(function() {
                    that.refreshImg();
                }, Config.gfiImgReloadTime);
            }
        },
        refreshImg: function() {
            var img= document.getElementById(this.get('id'));
            this.set('zufallszahl', Math.floor(Math.random() * (20000 - 0 + 1)) + 0);
            img.src = img.src.split('?')[0] + '?' + this.get('zufallszahl');
        }
    });
    return ImgModel;
});
