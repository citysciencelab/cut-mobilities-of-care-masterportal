define([
    "backbone",
    "eventbus",
    "openlayers",
    "config",
    "bootstrap/popover",
    "modules/gfipopup/gfiObjects/img/view",
    "modules/gfipopup/gfiObjects/video/view",
    "modules/gfipopup/gfiObjects/routing/view",
    "modules/gfipopup/gfiObjects/routable/view",
    "modules/core/util"
], function (Backbone, EventBus, ol, Config, Popover, ImgView, VideoView, RoutingView, RoutableView, Util) {
    "use strict";
    var GFIContentDefaultModel = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
        },
        /**
         *
         */
        initialize: function () {
        },
        /**
         * Hier werden bei bestimmten Keywords Objekte anstatt von Texten für das template erzeugt. Damit können Bilder oder Videos als eigenständige Objekte erzeugt und komplex
         * gesteuert werden. Im Template werden diese Keywords mit # ersetzt und rausgefiltert. Im view.render() werden diese Objekte attached.
         * Eine leidige Ausnahme bildet z.Z. das Routing, da hier zwei features des Reisezeitenlayers benötigt werden. (1. Ziel(key) mit Dauer (val) und 2. Route mit ol.geom (val).
         * Das Auswählen der richtigen Werte für die Übergabe erfolgt hier.
         */
        replaceValuesWithChildObjects: function () {
            var element = this.get('gfiContent'),
                children = [],
                lastroutenval,
                lastroutenkey;
            _.each(element, function (val, key) {
                if (key === "Bild") {
                    var imgView = new ImgView(val);
                    element[key] = '#';
                    children.push({
                        key: imgView.model.get('id'),
                        val: imgView
                    });
                } else if (key === "video") {
                    var videoView = new VideoView(val);
                    element[key] = '#';
                    children.push({
                        key: videoView.model.get('id'),
                        val: videoView
                    });
                } else if (_.isObject(val) === false && val.indexOf('Min, ') !== -1 && val.indexOf('km') !== -1) {
                    // Dienst liefert erst key=Flughafen Hamburg mit val=24 Min., 28km ohne Route
                    lastroutenval = val;
                    lastroutenkey = key;
                    element[key] = '#';
                } else if (key.indexOf('Route') === 0) {
                    // Nächstes element des Objects ist die Route
                    var routingView = new RoutingView(lastroutenkey, lastroutenval, val);
                    children.push({
                        key: routingView.model.get('id'),
                        val: routingView
                    });
                    element[key] = '#';
                }
                //lösche leere Dummy-Einträge wieder raus.
                element = _.omit(element, function (value) {
                    return value === '#';
                });
            }, this);
            if (children.length > 0) {
                _.extend(element, {
                    children: children
                });
            }
            this.set('gfiContent', element);
        },
        /**
         * Alle children und Routable-Button im gfiContent müssen hier removed werden.
         */
        removeChildObjects: function () {
            _.each(this.get('gfiContent'), function (element) {
                if (_.has(element, 'children')) {
                    var children = _.values(_.pick(element, 'children'))[0];
                    _.each(children, function (child) {
                        child.val.remove();
                    }, this);
                }
            }, this);
            _.each(this.get('gfiRoutables'), function (element) {
                if (_.isObject(element) === true) {
                    element.remove();
                }
            }, this);
        }
    });

    return new GFIContentDefaultModel();
});
