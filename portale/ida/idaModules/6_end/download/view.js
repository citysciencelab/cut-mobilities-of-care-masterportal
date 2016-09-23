define([
    "backbone",
    "eventbus",
    "idaModules/6_end/download/model"
], function (Backbone, EventBus, Model) {
    "use strict";
    var DownloadView = Backbone.View.extend({
        el: "#downloadpage",
        model: Model,
        events: {
            "click #downloadbutton": "initDownload",
            "click #refreshbutton": "reload"
        },
        initialize: function (fileid) {
            this.listenTo(this.model, "change:downloadpath", this.setDownloadpath),
            this.listenTo(this.model, "change:result", this.setResult),
            this.listenTo(this.model, "change:fehlermeldung", this.setError);

            this.model.set("fileid", fileid);

            this.model.copyPDF();
            this.show();
        },/*
        weiter: function () {
            new Seite5(this.model.get("filepath"));
        },*/
        show: function () {
            $("#seite_eins").hide();
            $("#seite_zwei").hide();
            $("#seite_drei").hide();
            $("#seite_vier").hide();
            $("#downloadpage").show();
        },
        initDownload: function () {
            $("#refreshbutton").prop("disabled", false);
            window.open(this.model.get("downloadpath"));
        },
        reload: function () {
            var path = window.location.origin + window.location.pathname;

            window.location.href = path;
        },
        setResult: function () {
            $("#downloadresult").addClass("bg-success");
            $("#downloadresult").text(this.model.get("result"));
            $("#downloadbutton").prop("disabled", false);
        },
        setError: function () {
            $("#downloadresult").addClass("bg-danger");
            $("#downloadresult").text(this.model.get("fehlermeldung"));
            $("#downloadbutton").prop("disabled", true);
        }
    });

    return DownloadView;
});
