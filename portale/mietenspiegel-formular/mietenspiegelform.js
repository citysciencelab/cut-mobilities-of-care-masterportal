define([
    "backbone",
    "eventbus",
    "config",
    "modules/layer/list",
    "modules/gfipopup/themes/mietenspiegel/view-formular",
    "modules/core/requestor",
    "modules/core/mapView",
    "modules/core/util",
    "bootstrap/alert"
], function (Backbone, EventBus, Config, LayerList, MSView, Requestor, MapView, Util, Alert) {
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
            EventBus.on("mapView:setCenter", this.newSearch, this); //Event der Searchbar bei erfolgreicher Suche
            this.set("msLayer", LayerList.models[0].get("layer"));
            this.set("projection", MapView.get("view").getProjection());
            var msWin = new MSView(this.get("msLayer"), "");
            $("#mietenspiegel-formular").append(msWin.$el); //leerer Dummy-Eintrag
        },
        /**
         * Abfrage des Wohnlagendienstes gemäß Config-Eintrag
         */
        requestMietenspiegel: function (coord) {
            var params = {
                typ: "WMS",
                url: this.get("msLayer").getSource().getGetFeatureInfoUrl(coord, 0.13229159522920522, this.get("projection"), {INFO_FORMAT: "text/xml"}),
                name: this.get("msLayer").get("name"),
                ol_layer: this.get("msLayer")
            };
            return Requestor.requestFeatures([[params], coord]);
        },
        /**
         * Diese Funktion wird nach einer erfolgreichen Suche in der Searchbar aufgerufen
         */
        newSearch: function (marker) {
            Util.showLoader();
            $("#noWohnlageMsg").remove();
            var response = this.requestMietenspiegel(marker),
                layers = response[0],
                layer = layers[0],
                feature = layer.content[0],
                coord = response[1];
            if (feature) {
                var msWin = new MSView(this.get("msLayer"), feature);
            }
            else {
                var html = "<div id='noWohnlageMsg' class='alert alert-info alert-dismissible' role='alert'>";
                html += "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times";
                html += "</span></button>";
                html += "An der gesuchten Adresse liegen <strong>keine Wohnlagendaten</strong> vor.";
                html += "</div>";
                var msWin = new MSView(this.get("msLayer"), "");
                msWin.$el.prepend(html);
            }
            $("#mietenspiegel-formular").empty();
            $("#mietenspiegel-formular").append(msWin.$el);
            msWin.focusNextMerkmal(0);
            Util.hideLoader();
        }
    });

    return formular;
});
