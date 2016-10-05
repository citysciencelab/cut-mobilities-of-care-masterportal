define([
    "backbone",
    "eventbus",
    "idaModules/6_end/download/model",
    "text!idaModules/6_end/download/template.html"
], function (Backbone, EventBus, Model, Template) {
    "use strict";
    var DownloadView = Backbone.View.extend({
        id: "download",
        model: Model,
        template: _.template(Template),
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
            this.render();
        },/*
        weiter: function () {
            new Seite5(this.model.get("filepath"));
        },*/
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $("section").append(this.$el.html(this.template(attr)));
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
