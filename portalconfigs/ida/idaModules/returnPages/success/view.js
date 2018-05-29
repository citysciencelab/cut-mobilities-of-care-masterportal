define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        DownloadModel = require("idaModules/returnPages/success/model"),
        Template = require("text!idaModules/returnPages/success/template.html"),
        Config = require("config"),
        DownloadView;

    DownloadView = Backbone.View.extend({
        id: "download",
        model: new DownloadModel(),
        template: _.template(Template),
        events: {
            "click #downloadIDA": "initDownloadIDA",
            "click #downloadBill": "initDownloadBill",
            "click #refreshbutton": "reload"
        },
        initialize: function (orderId) {
            this.listenTo(this.model, {
                "change:hasBill": this.showBill,
                "change:refreshEnabled": this.refreshEnabled
            });

            Radio.trigger("Info", "setNavStatus", "navbar-6-download");

            this.render();
            this.model.setOrderId(orderId);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $("body").append(this.$el.html(this.template(attr)));
        },
        initDownloadIDA: function () {
            this.model.setIdaDownloaded();
            window.open(Config.downloaderURL + "?ORDERID=" + this.model.getOrderId());
        },
        initDownloadBill: function () {
            this.model.setBillDownloaded();
            window.open(Config.downloaderURL + "?ORDERID=" + this.model.getOrderId() + "&TYPE=RECHNUNG");
        },
        reload: function () {
            var path = window.location.origin + window.location.pathname;

            window.location.href = path;
        },
        showBill: function () {
            // zeige Div für Download
            $("#downloadBillDiv").show();

            // korrigiere String mit Hinweis
            $("#downloadText").text("Ihre Auskunft und Ihre Rechnung liegen nun zum Download auf unseren Servern bereit. Bitte laden Sie sie jetzt herunter.");
        },
        refreshEnabled: function () {
            $("#refreshbutton").prop("disabled", false);
        }
    });

    return DownloadView;
});
