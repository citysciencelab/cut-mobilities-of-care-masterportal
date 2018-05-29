define([
    "backbone",
    "backbone.radio",
    "config",
    "modules/gfipopup/themes/mietenspiegel/view",
    "modules/core/requestor",
    "modules/core/util"
], function (Backbone, Radio, Config, MSView, Requestor, Util) {
    /*
     * Im Mietenspiegel-Formular-Portal wird die <div id="map"> mit display = none; geladen. Stattdessen wird in der index.html ein <div id="mietenspiegel-formular> angelegt und in dieses wird
     * das Template des Mietenspiegerls leicht angepasst eingefügt. Die map ruft initial keine Dienste ab weil display=none, dennoch stehen alle ol-Funktionen, Config, etc.
     * zur Verfügung. Der Einstieg ins Portal muss Mangels map über dieses CustomModule geschehen, in dem die view des Mietenspiegel-Themes (leicht angepasst, daher mietenspiegel/view-formular)
     * geladen und dem <div> appended wird. Die Searchbar wird ebenfalls geladen und liefert die Adresssuche. Diese feuert ein Event "setCenter", wenn eine Hausnummernsuche erfolgreich war.
     * Dieses Event wird hier behandelt und die Geokoordinate der gesuchten Adresse wird zur Abfrage der Wohnlagen verwendet. Das Abfragen des Dienstes erfolgt nun über ein requestor.js.
     *
     * Da dieses Formular schmal ist und über einen iFrame eingebunden wird, liegt die SearchBar links wie bei mobiler Ausspielung.
     */
    var formular = Backbone.Model.extend({
        defaults: {
            msLayer: "",
            projection: ""
        },
        initialize: function () {
            // EventBus.on("renderResults", this.receiveWohnlage, this); // Event der gfiAbfrage
            // EventBus.on("mapView:setCenter", this.newSearch, this); // Event der Searchbar bei erfolgreicher Suche
            // EventBus.on("layerlist:sendBaselayerList", this.layerListReady, this); // in gebauter Version
            this.layerListReady(); // bei Entwicklung
        },
        layerListReady: function () {
            var layerList = Radio.request("LayerList", "getLayerList"),
                proj = Radio.request("MapView", "getProjection");

            this.set("projection", proj);
            this.set("msLayer", _.find(layerList, function (layer) {
                return layer.id === "2834" || layer.id === "2835";
            }));
            var msWin = new MSView(this.get("msLayer"), "", "", true);

            $("#mietenspiegel-formular").append(msWin.$el); // leerer Dummy-Eintrag
        },
        /**
         * Abfrage des Wohnlagendienstes gemäß Config-Eintrag
         */
        requestWohnlage: function (coord) {
            var msLayer = this.get("msLayer"),
                layer = msLayer.get("layer"),
                projection = this.get("projection"),
                params = {
                    typ: "WMS",
                    url: layer.getSource().getGetFeatureInfoUrl(coord, 0.13229159522920522, projection, {INFO_FORMAT: "text/xml"}),
                    name: layer.get("name"),
                    ol_layer: layer
                };

            Util.showLoader();
            Requestor.requestFeatures([[params], coord]);
        },
        /*
        * Wird beim renderResults aufgerufen, also wenn die GFI Abfrage erfolgt ist, und wertet die response aus.
        */
        receiveWohnlage: function (response) {
            var hits = response[0],
                hit = _.values(_.pick(hits, "0"))[0],
                content = _.values(_.pick(hit, "content"))[0],
                feature = _.values(_.pick(content, "0"))[0],
                coord = response[1];

            if (feature) {
                this.fillFormular(feature);
            }
            else {
                this.noFeature();
            }
        },
        noFeature: function () {
            var msWin = new MSView(this.get("msLayer"), "", "", true);
            $("#mietenspiegel-formular").empty();
            $("#mietenspiegel-formular").append(msWin.$el);
            $("#noWohnlageMsg").fadeIn(500);
            setInterval(function () {
                $("#noWohnlageMsg").fadeOut(500);
            }, 5000);
            msWin.focusNextMerkmal(-1);
        },
        fillFormular: function (feature) {
            var msWin = new MSView(this.get("msLayer"), feature, "", true);
            $("#mietenspiegel-formular").empty();
            $("#mietenspiegel-formular").append(msWin.$el);
            msWin.focusNextMerkmal(0);
        },
        /**
         * Diese Funktion wird nach einer erfolgreichen Suche in der Searchbar aufgerufen
         */
        newSearch: function (marker) {
            $("#noWohnlageMsg").fadeOut(500);
            this.requestWohnlage(marker);
        }
    });

    return formular;
});
