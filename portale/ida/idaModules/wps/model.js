define([
    "underscore",
    "backbone",
    "eventbus",
    "config",
    "modules/core/util",
    "modules/restReader/collection"
], function (_, Backbone, EventBus, Config, Util, RestReader) {

    var WPSModel = Backbone.Model.extend({
        defaults: {
            url: "",
            data: ""
        },
        initialize: function () {
            var resp = RestReader.getServiceById(Config.wpsID),
                newURL = Util.getProxyURL(resp[0].get("url"));

            this.set("url", newURL);
            EventBus.on("wps:request", this.request, this);
        },
        request: function (data) {
            console.log(data);
            this.set("data", data);
            Util.showLoader();
            $.ajax({
                url: this.get("url") + "?Request=Execute&Service=WPS&Version=1.0.0",
                data: this.get("data"),
                headers: {
                    "Content-Type": "text/xml; charset=UTF-8"
                },
                context: this,
                method: "POST",
                complete: function (jqXHR) {
                    Util.hideLoader();
                    console.log(jqXHR);
//                    if (jqXHR.status !== 200 || jqXHR.responseText.indexOf("ExceptionReport") !== -1) {
//                        EventBus.trigger("alert", {text: "<strong>Dienst antwortet nicht wie erwartet.</strong> Bitte versuchen Sie es später wieder.", kategorie: "alert-warning"});
//                    }
//                    if (data.getElementsByTagName("jobStatus") !== undefined && data.getElementsByTagName("jobStatus")[0].textContent === "FME_FAILURE") {
//                        this.showErrorMessage();
//                    }
                },
                success: function (response) {
                    Util.hideLoader();
                    EventBus.trigger("wps:response", this.get("data"), response);
                }
            });
            $("#loader").show();
        }
    });

    return new WPSModel();
});
