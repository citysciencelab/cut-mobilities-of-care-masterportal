define([
    "backbone",
    "config",
    "backbone.radio",
    "eventbus"
], function () {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        EventBus = require("eventbus"),

        ZoomToFeature = Backbone.Model.extend({
        defaults: {
            prefs: {},
            centerlist: [],
            bboxes: []
        },
        initialize: function () {
            var channel = Radio.channel("zoomtofeature");

            channel.on({
                "zoomtoid": this.zoomtoid
            }, this);
            channel.reply({
                "getCenterList": this.getCenterlist()
            }, this);
            this.listenTo(EventBus, {
                "layerlist:sendVisiblelayerList": this.checkLayer
            });
        },
        setPrefs: function (value) {
            this.set("prefs", value);
        },
        getPrefs: function () {
            return this.get("prefs");
        },
        setCoordsX: function (value) {
            this.set("coordsX", value);
        },
        getCoordsX: function () {
            return this.get("coordsX");
        },
        setCoordsY: function (value) {
            this.set("coordsY", value);
        },
        getCoordsY: function () {
            return this.get("coordsY");
        },
        setBboxes: function (value) {
            this.set("bboxes", value);
        },
        getBboxes: function () {
            return this.get("bboxes");
        },
        setCenterlist: function (value) {
            this.set("centerlist", value);
        },
        getCenterlist: function () {
            return this.get("centerlist");
        },

        // holt sich "zoomtofeature" aus der Config, prüft ob ID vorhanden ist
        zoomtoid: function () {
            var prefs = Config.zoomtofeature;

            this.setPrefs(prefs);
            if (!_.isUndefined(prefs.id)) {
                this.requestFeatureFromWFS();
            }
        },

        // baut sich aus den Config-prefs die URL zusammen
        requestFeatureFromWFS: function () {
            var prefs = this.getPrefs(),
            id = prefs.id, // wird von parametricUrl in die config geschrieben
            url = prefs.url,
            version = prefs.version,
            typename = prefs.typename,
            valuereference = prefs.valuereference,
            ids = id.split(",");

            _.each(ids, function (id) {
                var data = "service=WFS&version=" + version + "&request=GetFeature&TypeName=" + typename + "&Filter=<Filter><PropertyIsEqualTo><ValueReference>" + valuereference + "</ValueReference><Literal>" + id + "</Literal></PropertyIsEqualTo></Filter>";
                this.sendRequest(url, data);
            }, this);
            this.sendToMap();
        },

        // feuert den AJAX request ab
        sendRequest: function (url, data) {
            $.ajax({
                    url: Radio.request("Util", "getProxyURL", url),
                    data: encodeURI(data),
                    context: this,
                    async: false,
                    type: "GET",
                    success: this.getFeatures,
                    timeout: 6000,
                    error: function () {
                        var msg = "URL: " + Radio.request("Util", "getProxyURL", url) + " nicht erreichbar.";

                        Radio.trigger("Alert", "alert", msg);
                    }
                });
        },

        // holt sich aus der AJAX response die Daten, prüft auf Geometrietyp (MultiPolygon oder Polygon)
        getFeatures: function (data) {
            var geometry = $("app\\:the_geom,the_geom", data);

                // wenn MultiPolygon
                if ($(geometry).find("gml\\:MultiSurface,MultiSurface")[0] !== undefined) {
                    var allCoords = $(geometry).find("gml\\:posList,posList"),
                        coordsListMultiX = [],
                        coordsListMultiY = [];

                    _.each(allCoords, function (coordslist) {
                        var coords = coordslist.textContent.split(" "),
                            coordsList = this.storeCoords(coords);

                        _.each(coordsList[0], function (x) {
                            coordsListMultiX.push(x);
                        });
                        _.each(coordsList[1], function (y) {
                            coordsListMultiY.push(y);
                        });

                    }, this);

                    allCoords = [coordsListMultiX, coordsListMultiY];
                    this.calculateCenter(allCoords);
                    this.calculateBBOX(allCoords);
                }
                // wenn einzelnes Polygon
               else {

                   try {
                       var coords = $(geometry).find("gml\\:posList,posList")[0].textContent.split(" "),
                        coordsList = this.storeCoords(coords);

                       this.calculateCenter(coordsList);
                       this.calculateBBOX(coordsList);
                   }
                   catch (e) {}
               }
        },

        // sortiert coords in je ein array mit x-koords und y-koords
        storeCoords: function (coords) {
            var coordsX = [],
                coordsY = [],
                coordsList = [];

            _.each(coords, function (coord, i) {
               // xkoordinate
               if (i % 2 === 0) {
                   coordsX.push(coord);
               }
               // ykoordinate
               else {
                   coordsY.push(coord);
               }
            });
            coordsList.push(coordsX);
            coordsList.push(coordsY);

            return coordsList;
        },

        // berechnet den Mittelpunkt der Geometrie und added ihn in das globale "centerlist"-array
        calculateCenter: function (coordsList) {
            var coordsX = coordsList[0],
                coordsY = coordsList[1],
                Xmin = 0,
                Xmax = 0,
                Ymin = 0,
                Ymax = 0,
                centerlist = this.getCenterlist();

            coordsX.sort();
            coordsY.sort();

            Xmin = parseFloat(coordsX[0]);
            Xmax = parseFloat(coordsX[coordsX.length - 1]);
            Ymin = parseFloat(coordsY[0]);
            Ymax = parseFloat(coordsY[coordsY.length - 1]);

            var center = [];

            center.push(Xmin + (Xmax - Xmin) / 2);
            center.push(Ymin + (Ymax - Ymin) / 2);
            centerlist.push(center);
            this.setCenterlist(centerlist);
        },

        // berechnet die BoundingBox für jede Geometrie und added sie in das globale "bboxes"-array
        calculateBBOX: function (coordsList) {

            var coordsX = coordsList[0],
                coordsY = coordsList[1],
                Xmin = 0,
                Xmax = 0,
                Ymin = 0,
                Ymax = 0,
                bboxes = this.getBboxes();

            coordsX.sort();
            coordsY.sort();

            Xmin = parseFloat(coordsX[0]);
            Xmax = parseFloat(coordsX[coordsX.length - 1]);
            Ymin = parseFloat(coordsY[0]);
            Ymax = parseFloat(coordsY[coordsY.length - 1]);

            var bbox = [];

            bbox.push(Xmin);
            bbox.push(Ymin);
            bbox.push(Xmax);
            bbox.push(Ymax);

            bboxes.push(bbox);
            this.setBboxes(bboxes);
        },

        // holt sich das "bboxes"-array, berechnet aus allen bboxes die finale bbox und sendet diese an die map
        sendToMap: function () {
            var bboxes = this.getBboxes(),
                Xmins = [],
                Xmaxs = [],
                Ymins = [],
                Ymaxs = [],
                finalbbox = [];

            _.each(bboxes, function (bbox) {
                Xmins.push(bbox[0]);
                Ymins.push(bbox[1]);
                Xmaxs.push(bbox[2]);
                Ymaxs.push(bbox[3]);
            });

            Xmins.sort();
            Ymins.sort();
            Xmaxs.sort();
            Ymaxs.sort();

            finalbbox.push(Xmins[0]);
            finalbbox.push(Ymins[0]);
            finalbbox.push(Xmaxs[Xmaxs.length - 1]);
            finalbbox.push(Ymaxs[Ymaxs.length - 1]);

            if (finalbbox[0] !== undefined && finalbbox[1] !== undefined && finalbbox[2] !== undefined && finalbbox[3] !== undefined) {
               Radio.trigger("map", "setBBox", finalbbox);
            }
        }
    });

    return ZoomToFeature;
});
