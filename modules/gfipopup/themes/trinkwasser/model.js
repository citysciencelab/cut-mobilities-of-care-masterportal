define([
    "backbone",
    "config",
    "modules/gfipopup/gfiObjects/img/view",
    "modules/gfipopup/gfiObjects/video/view",
    "modules/gfipopup/gfiObjects/routable/view"
], function (Backbone, Config, ImgView, VideoView, RoutableView) {
    "use strict";
    var GFIContentTrinkwasserModel = Backbone.Model.extend({
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
            this.set("id", _.uniqueId("trinkwasserTheme"));
            this.set("layer", layer);
            this.splitContent(content);
            this.set("position", position);
            this.set("gfiTitel", layer.get("name"));
            this.replaceValuesWithChildObjects();
            this.checkRoutable();
        },
        splitContent: function (content) {
            var allgemContent = {},
             mikrobioContent = {},
             chemContent = {};

            _.each(content, function (value, key) {
                if (_.contains(["Probenahmestelle probe_entnahmedatum", "Bezirk", "Stadtteil", "Versorgungsgebiet"], key)) {
                    allgemContent[key] = value;
                }
                else if (_.contains(["Coliforme bakterien", "Coliforme bakterien_mpn", "Escherichia coli", "Escherichia coli__e_coli__mpn", "Koloniezahl 36c__trinkwv_2001_anlage_5_i_d_bb___trinkwv_00", "Koloniezahl 20c__trinkwv_1990_", "intestinale_enterokokken", "Coliforme bakterien_grenzwertwarnung", "Coliforme bakterien_mpn_grenzwertwarnung", "Escherichia coli_grenzwertwarnung", "Escherichia coli__e_coli__mpn_grenzwertwarnung", "Koloniezahl 36c__trinkwv_2001_anlage_5_i_d_bb___trinkwv_00_grenzwertwarnung", "Koloniezahl 20c__trinkwv_1990__grenzwertwarnung", "intestinale_enterokokken_grenzwertwarnung"], key)) {
                    mikrobioContent[key] = value;
                }
                else {
                    chemContent[key] = value;
                }
            });
            this.set("gfiContent", {"allgemContent": allgemContent, "mikrobioContent": mikrobioContent, "chemContent": chemContent});
        },
        /**
         * Gibt den Print-Content ans popup-Model zurück. Wird als Funktion aufgerufen. Liefert ein Objekt aus.
         */
        returnPrintContent: function() {
            return [this.get("gfiContent"),
                    this.get("gfiTitel")];
        },
        /**
         * Prüft, ob der Button zum Routen angezeigt werden soll
         */
        checkRoutable: function () {
            if (Config.menu.routing && Config.menu.routing === true) {
                if (this.get("layer").get("routable") === true) {
                    this.set("routable", new RoutableView(this.get("position")));
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
                children = [],
                lastroutenval,
                lastroutenkey;
            _.each(element, function (val, key) {
                if (key === "Bild") {
                    var imgView = new ImgView(val);
                    element[key] = "#";
                    children.push({
                        key: imgView.model.get("id"),
                        val: imgView
                    });
                }
                else if (key === "video") {
                    var videoView = new VideoView(val);
                    element[key] = "#";
                    children.push({
                        key: videoView.model.get("id"),
                        val: videoView
                    });
                }
                // lösche leere Dummy-Einträge wieder raus.
                element = _.omit(element, function (value) {
                    return value === "#";
                });
            }, this);
            if (children.length > 0) {
                this.set("children", children);
            }
            this.set("gfiContent", element);
        },
        /**
         * Alle children und Routable-Button (alles Module) im gfiContent müssen hier removed werden.
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

    return GFIContentTrinkwasserModel;
});
