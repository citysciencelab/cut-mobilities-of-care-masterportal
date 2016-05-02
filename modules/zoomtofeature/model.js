define([
    "backbone",
    "config",
    "backbone.radio",
    "modules/core/util"
], function () {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        Util = require("modules/core/util");

    var ZoomToFeature = Backbone.Model.extend({
        defaults:{
            prefs:{},
            coordsX: [],
            coordsY: [],
            Xmin: 0,
            Xmax: 0,
            Ymin: 0,
            Ymax: 0,
            center: [],
            bbox: []
        },
        initialize: function () {
            var channel = Radio.channel("zoomtofeature");
            channel.on({
                "zoomtoid": this.zoomtoid
            }, this);
        },
        setPrefs: function (value){
            this.set("prefs", value);
        },
        getPrefs: function (){
            return this.get("prefs");
        },
        setCoordsX: function (value){
            this.set("coordsX", value);
        },
        getCoordsX: function (){
            return this.get("coordsX");
        },
        setCoordsY: function (value){
            this.set("coordsY", value);
        },
        getCoordsY: function (){
            return this.get("coordsY");
        },
        setXmin: function (value){
            this.set("Xmin", value);
        },
        getXmin: function (){
            return this.get("Xmin");
        },
        setXmax: function (value){
            this.set("Xmax", value);
        },
        getXmax: function (){
            return this.get("Xmax");
        },
        setYmin: function (value){
            this.set("Ymin", value);
        },
        getYmin: function (){
            return this.get("Ymin");
        },
        setYmax: function (value){
            this.set("Ymax", value);
        },
        getYmax: function (){
            return this.get("Ymax");
        },
        setCenter: function (value){
            this.set("center", value);
        },
        getCenter: function (){
            return this.get("center");
        },
        setBbox: function (value){
            this.set("bbox", value);
        },
        getBbox: function (){
            return this.get("bbox");
        },

        zoomtoid: function (){
            var prefs = Config.zoomtofeature;

            this.setPrefs(prefs);
            if (!_.isUndefined(prefs.id)){
                this.requestFeatureFromWFS();
            }
        },
        requestFeatureFromWFS: function (){
            var prefs = this.getPrefs(),
            id = prefs.id,
            url = prefs.url,
            version = prefs.version,
            typename = prefs.typename,
            literalprefix = prefs.literalprefix;

            data ="service=WFS&version=" + version + "&request=GetFeature&TypeName=" + typename + "&Filter=<Filter><PropertyIsEqualTo><ValueReference>@gml:id</ValueReference><Literal>" + literalprefix + id + "</Literal></PropertyIsEqualTo></Filter>";
            this.sendRequest(url, data);
        },
        sendRequest: function (url, data) {
            $.ajax({
                    url: Util.getProxyURL(url),
                    data: data,
                    context: this,
                    async: false,
                    type: "GET",
                    success: this.getFeatures,
                    timeout: 6000,
                    error: function () {
                        alert("URL: "+ Util.getProxyURL(url) + " nicht erreichbar.");
                    }
                });
        },
        getFeatures: function (data) {
            var geometry = $("app\\:the_geom,the_geom", data);
                // wenn MultiPolygon
                if ($(geometry).find("gml\\:MultiSurface,Multisurface")[0] !== undefined) {
                    var allCoords = $(geometry).find("gml\\:posList,posList");
                    _.each(allCoords, function (coordslist) {
                        var coords = coordslist.textContent.split(" ");
                        this.storeCoords(coords);
                    }, this);
                        this.calculateBBOX();
                }
                // wenn einzelnes Polygon
               else {
                   try{
                       var coords = $(geometry).find("gml\\:posList,posList")[0].textContent.split(" ");
                       this.storeCoords(coords);
                       this.calculateBBOX();
                   }
                   catch (e) {}
               }
        },
        storeCoords: function (coords) {
            var coordsX = this.getCoordsX(),
                coordsY = this.getCoordsY();

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
            this.setCoordsX(coordsX);
            this.setCoordsY(coordsY);

        },
        calculateBBOX: function () {
            var coordsX = this.getCoordsX(),
                coordsY = this.getCoordsY(),
                Xmin = this.getXmin(),
                Xmax = this.getXmax(),
                Ymin = this.getYmin(),
                Ymax = this.getYmax(),
                center = this.getCenter(),
                bbox = this.getBbox();

               coordsX.sort();
               coordsY.sort();

               Xmin = parseFloat(coordsX[0]);
               Xmax = parseFloat(coordsX[coordsX.length - 1]);
               Ymin = parseFloat(coordsY[0]);
               Ymax = parseFloat(coordsY[coordsY.length - 1]);

               center.push(Xmin + (Xmax - Xmin) / 2);
               center.push(Ymin + (Ymax - Ymin) / 2);

               bbox.push(Xmin);
               bbox.push(Ymin);
               bbox.push(Xmax);
               bbox.push(Ymax);

                Radio.trigger("MapView", "setCenter", center);
                Radio.trigger("map", "setBBox", bbox);
        }

    });

    return ZoomToFeature;
});
