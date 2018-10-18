const ImgModel = Backbone.Model.extend({
    /**
     *
     */
    defaults: {
        id: "",
        zufallszahl: "",
        url: "",
        copyright: "",
        gfiImgReloadTime: 0,
        checkInterval: "",
        reloadInterval: "",
        reloadMaxVersuche: 10,
        reloadVersuch: 1
    },

    initialize: function () {
        this.set("id", _.uniqueId("img"));
        if (Config.gfiImgReloadTime && Config.gfiImgReloadTime > 0) {
            this.set("gfiImgReloadTime", Config.gfiImgReloadTime);
            this.set("reloadInterval", setInterval(function () {
                this.set("zufallszahl", Math.floor(Math.random() * (20000 - 0 + 1)) + 0);
            }.bind(this), this.get("gfiImgReloadTime")));
        }
        this.listenTo(this, "change:zufallszahl", this.reloadImage);
    },
    reloadImage: function () {
        var img = document.getElementById(this.get("id"));

        if (img) {
            img.src = img.src.split("?")[0] + "?" + this.get("zufallszahl");
            this.checkImage();
        }
    },
    checkImage: function () {
        window.clearInterval(this.get("checkInterval")); // altes Interval löschen
        this.set("checkInterval", setInterval(function () {
            if (document.getElementById(this.get("id")) && document.getElementById(this.get("id")).complete) {
                if (document.getElementById(this.get("id")).naturalWidth !== 0) {
                    window.clearInterval(this.get("checkInterval"));
                    this.set("reloadVersuch", 1);
                }
                else {
                    this.reloadImage();
                }
            }
            this.set("reloadVersuch", this.get("reloadVersuch") + 1);
        }.bind(this), 1000));
    },
    destroy: function () {
        this.unbind();
        this.clear({silent: true});
        window.clearInterval(this.get("checkInterval"));
        window.clearInterval(this.get("reloadInterval"));
    }
});

export default ImgModel;
