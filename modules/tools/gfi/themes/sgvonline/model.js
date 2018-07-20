define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        Radio = require("backbone.radio"),
        ImgView = require("modules/tools/gfi/objects/image/view"),
        VideoView = require("modules/tools/gfi/objects/video/view"),
        RoutableView = require("modules/tools/gfi/objects/routingButton/view"),
        SgvOnlineTheme;

    SgvOnlineTheme = Theme.extend({

        initialize: function () {
            this.listenTo(this, {
                "change:isReady": function () {
                    this.replaceValuesWithChildObjects();
                    this.checkRoutable();
                },
                "change:gfiContent": function () {
                    this.getAmtlVergAddr();
                }
            });
        },

        /**
         * Prüft, ob der Button zum Routen angezeigt werden soll
         */
        checkRoutable: function () {
            if (_.isUndefined(Radio.request("Parser", "getItemByAttributes", {id: "routing"})) === false) {
                if (this.get("routable") === true) {
                    this.set("routable", new RoutableView());
                }
            }
        },
        /**
         * Hier werden bei bestimmten Keywords Objekte anstatt von Texten für das template erzeugt. Damit können Bilder oder Videos als eigenständige Objekte erzeugt und komplex
         * gesteuert werden. Im Template werden diese Keywords mit # ersetzt und rausgefiltert. Im view.render() werden diese Objekte attached.
         * Eine leidige Ausnahme bildet z.Z. das Routing, da hier zwei features des Reisezeitenlayers benötigt werden. (1. Ziel(key) mit Dauer (val) und 2. Route mit ol.geom (val).
         * Das Auswählen der richtigen Werte für die Übergabe erfolgt hier.
         */
        replaceValuesWithChildObjects: function () {
            var element = this.get("gfiContent"),
                children = [];

            if (_.isString(element) && element.match(/content="text\/html/g)) {
                children.push(element);
            }
            else {
                _.each(element, function (ele) {
                    _.each(ele, function (val, key) {
                        if (key === "Bild") {
                            var imgView = new ImgView(val);

                            element[key] = "#";
                            children.push({
                                key: imgView.model.get("id"),
                                val: imgView
                            });
                        }
                        else if (key === "video" && Radio.request("Util", "isAny") === null) {
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
                        else if (key === "mobil_video" && Radio.request("Util", "isAny")) {
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
                        // lösche leere Dummy-Einträge wieder raus.
                        element = _.omit(element, function (value) {
                            return value === "#";
                        });
                    }, this);
                });
            }
            if (children.length > 0) {
                this.set("children", children);
            }
            this.set("gfiContent", element);
        },
        getAmtlVergAddr: function () {
            var key = "Amtlich vergebene Adresse",
                val;

            if (this.get("gfiContent")[0].hasOwnProperty(key)) {
                val = this.get("gfiContent")[0][key];
                if (val === "S" || val === "B" || val === "Ja") {
                    this.get("gfiContent")[0][key] = "Ja";
                }
                else {
                    this.get("gfiContent")[0][key] = "Nein";
                }
            }
        }
    });

    return SgvOnlineTheme;
});
