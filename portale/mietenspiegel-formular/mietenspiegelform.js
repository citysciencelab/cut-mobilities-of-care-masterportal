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

    var formular = Backbone.Model.extend({
        defaults: {
            msLayer: '',
            projection: ''
        },
        initialize: function () {
            EventBus.on("setCenter", this.newSearch, this); //Event der Searchbar bei erfolgreicher Suche
            this.set('msLayer', LayerList.models[0].get('layer'));
            this.set('projection', MapView.get('view').getProjection());
            var msWin = new MSView(this.get('msLayer'), '');
            $('#mietenspiegel-formular').append(msWin.$el); //leerer Dummy-Eintrag
        },
        /**
         * Abfrage des Wohnlagendienstes gemäß Config-Eintrag
         */
        requestMietenspiegel: function(coord) {
            var params = {
                typ: "WMS",
                url: this.get('msLayer').getSource().getGetFeatureInfoUrl(coord, 0.13229159522920522, this.get('projection'), {INFO_FORMAT: "text/xml"}),
                name: this.get('msLayer').get('name'),
                ol_layer: this.get('msLayer')
            };
            return Requestor.requestFeatures([[params], coord]);
        },
        /**
         * Diese Funktion wird nach einer erfolgreichen Suche in der Searchbar aufgerufen
         */
        newSearch: function(marker) {
            Util.showLoader();
            var response = this.requestMietenspiegel(marker),
                layers = response[0],
                layer = layers[0],
                feature = layer.content[0],
                coord = response[1];
            if (feature) {
                var msWin = new MSView(this.get('msLayer'), feature);
            } else {
                var html = "<div class='alert alert-info alert-dismissible' role='alert'>";
                html += "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times";
                html += "</span></button>";
                html += "An der gesuchten Adresse liegen <strong>keine Wohnlagendaten</strong> vor.";
                html += "</div>";
                var msWin = new MSView(this.get('msLayer'), '');
                msWin.$el.prepend(html);
            }
            $('#mietenspiegel-formular').empty();
            $('#mietenspiegel-formular').append(msWin.$el);
            msWin.focusNextMerkmal(0);
            Util.hideLoader();
        }
    });

    return formular;
});
