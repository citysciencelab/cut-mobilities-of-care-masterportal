define([
    "jquery",
    "backbone",
    "eventbus",
    "test/seite1/model",
    "test/seite1_lage/view",
    "modules/searchbar/view"
], function ($, Backbone, EventBus, Model, Seite1_Lage, Searchbar) {
    /*
     *
     */
    var Seite1View = Backbone.View.extend({
        el: "#page1",
        model: Model,
        events: {
//            "change": "change",
//            "keyup": "keyup"
        },
        initialize: function () {
            new Searchbar({
                gazetteer: {
                    minChars: 3,
                    url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                    searchStreets: true,
                    searchHouseNumbers: true
                },
                placeholder: "Suche nach Adresse",
                renderToDOM: "#adresse2"
            });
        },
        keyup: function (evt) {
            console.log(evt.target.id);
        }
    });

    return new Seite1View;
});
