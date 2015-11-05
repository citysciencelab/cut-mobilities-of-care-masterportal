define([
    "backbone",
    "eventbus",
    "moment"
], function (Backbone, EventBus, moment) {

    var LayerInformation = Backbone.Model.extend({
        url: "/hmdk/csw?service=CSW&version=2.0.2&request=GetRecordById&typeNames=csw:Record&elementsetname=summary",

        initialize: function () {
            this.listenTo(EventBus, {
                "layerinformation:add": this.setAttributes
            });
        },

        setAttributes: function (attrs) {
            this.set(attrs);
            console.log(attrs);
            this.fetchData({id: this.get("metaID")});
        },

        fetchData: function (data) {
            this.fetch({
                data: data,
                dataType: "xml",
                error: function () {
                    EventBus.trigger("alert", {
                        text: "Informationen zurzeit nicht verfügbar",
                        kategorie: "alert-warning"
                    });
                }
            });
        },

        parse: function (xmlDoc) {
            return {
                "abstractText": function () {
                    var abstractText = $("gmd\\:abstract,abstract", xmlDoc)[0].textContent;

                    if (abstractText.length > 1000) {
                        return abstractText.substring(0, 600) + "...";
                    }
                    else {
                        return abstractText;
                    }
                }(),
                "date": function () {
                    var date = $("gmd\\:dateStamp,dateStamp", xmlDoc)[0].textContent;

                    return moment(date).format("DD.MM.YYYY");
                }()
            }
        }
    });

    return LayerInformation;
});
