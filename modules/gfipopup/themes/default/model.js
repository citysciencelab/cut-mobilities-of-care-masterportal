define([
    "backbone",
    "backbone.radio",
    "modules/gfipopup/gfiObjects/img/view",
    "modules/gfipopup/gfiObjects/video/view",
    "modules/gfipopup/gfiObjects/routable/view",
    "modules/core/util"
], function (Backbone, Radio, ImgView, VideoView, RoutableView, Util) {
    "use strict";
    var GFIContentDefaultModel = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
            routable: null,
            children: null
        },
        /**
         *
         */
        initialize: function (layer, content, position) {
            this.set("id", _.uniqueId("defaultTheme"));
            this.set("layer", layer);
            this.set("gfiContent", content);
            this.set("position", position);
            this.set("gfiTitel", layer.get("name"));
            this.replaceValuesWithChildObjects();
            this.checkRoutable();
        },
        /**
         * Gibt den Print-Content ans popup-Model zurÃ¼ck. Wird als Funktion aufgerufen. Liefert ein Objekt aus.
         */
        returnPrintContent: function () {
            return [this.get("gfiContent"),
                    this.get("gfiTitel")];
        },
        /**
         * PrÃ¼ft, ob der Button zum Routen angezeigt werden soll
         */
        checkRoutable: function () {
            if (_.isUndefined(Radio.request("Parser", "getItemByAttributes", {id: "routing"})) === false) {
                if (this.get("layer").get("routable") === true) {
                    this.set("routable", new RoutableView(this.get("position")));
                }
            }
        },
        /**
         * Hier werden bei bestimmten Keywords Objekte anstatt von Texten fÃ¼r das template erzeugt. Damit kÃ¶nnen Bilder oder Videos als eigenstÃ¤ndige Objekte erzeugt und komplex
         * gesteuert werden. Im Template werden diese Keywords mit # ersetzt und rausgefiltert. Im view.render() werden diese Objekte attached.
         * Eine leidige Ausnahme bildet z.Z. das Routing, da hier zwei features des Reisezeitenlayers benÃ¶tigt werden. (1. Ziel(key) mit Dauer (val) und 2. Route mit ol.geom (val).
         * Das AuswÃ¤hlen der richtigen Werte fÃ¼r die Ãœbergabe erfolgt hier.
         */
        replaceValuesWithChildObjects: function () {
            var element = this.get("gfiContent"),
                children = [];

            if (_.isString(element) && element.match(/content="text\/html/g)) {
                children.push(element);
            }
            else {
                _.each(element, function (val, key) {
                    if (key === "Bild") {
                        var imgView = new ImgView(val);

                        element[key] = "#";
                        children.push({
                            key: imgView.model.get("id"),
                            val: imgView
                        });
                    }
                    else if (key === "video" && Util.isAny() === null) {
                        var videoView = new VideoView(val);

                        element[key] = "#";
                        children.push({
                            key: videoView.model.get("id"),
                            val: videoView
                        });
                        if (_.has(element, "mobil_video")) {
                            element.mobil_video = "#";
                        }
                    }
                    else if (key === "mobil_video" && Util.isAny()) {
                        var videoView = new VideoView(val);

                        element[key] = "#";
                        children.push({
                            key: videoView.model.get("id"),
                            val: videoView
                        });
                        if (_.has(element, "video")) {
                            element.video = "#";
                        }
                    }
                    // lÃ¶sche leere Dummy-EintrÃ¤ge wieder raus.
                    element = _.omit(element, function (value) {
                        return value === "#";
                    });
                }, this);
            }
            if (children.length > 0) {
                this.set("children", children);
            }
            this.set("gfiContent", element);
        },
        /**
         * Alle children und Routable-Button (alles Module) im gfiContent mÃ¼ssen hier removed werden.
         */
        destroy: function () {
            _.each(this.get("gfiContent"), function (element) {
                if (_.has(element, "children")) {
                    var children = _.values(_.pick(element, "children"))[0];

                    _.each(children, function (child) {
                        child.val.remove();
                    }, this);
                }
            }, this);
            _.each(this.get("gfiRoutables"), function (element) {
                if (_.isObject(element) === true) {
                    element.remove();
                }
            }, this);
        }
    });

    return GFIContentDefaultModel;
});
