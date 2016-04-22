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
            request: "",
            processesRunning: 0
        },
        initialize: function () {
            var resp = RestReader.getServiceById(Config.wpsID),
                newURL = Util.getProxyURL(resp[0].get("url"));

            this.set("url", newURL);
            this.listenTo(this, "change:processesRunning", this.checkProcesses);
            EventBus.on("wps:request", this.request, this);
        },
        request: function (request) {
            var request_str = "<wps:Execute xmlns:wps='http://www.opengis.net/wps/1.0.0' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:ows='http://www.opengis.net/ows/1.1' service='WPS' version='1.0.0' xsi:schemaLocation='http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd'><ows:Identifier>" + request.workbenchname + ".fmw</ows:Identifier>" + request.dataInputs + "</wps:Execute>";

            this.set("request", request);
            this.set("processesRunning", this.get("processesRunning") + 1);
            $.ajax({
                url: this.get("url") + "?Request=Execute&Service=WPS&Version=1.0.0",
                data: request_str,
                headers: {
                    "Content-Type": "text/xml; charset=UTF-8"
                },
                context: this,
                method: "POST",
                complete: function (jqXHR) {
                    this.set("processesRunning", this.get("processesRunning") - 1);
                    if (jqXHR.status !== 200 ||
                        jqXHR.responseText.indexOf("ExceptionReport") !== -1) {
                        alert ("Dienst antwortet nicht wie erwartet. Bitte versuchen Sie es später wieder.");
                    }
                },
                success: function (response) {
                    var exeResp = $("wps\\:ExecuteResponse,ExecuteResponse", response),
                        data = $(exeResp).find("wps\\:ComplexData,ComplexData")[0],
                        errorOccured = $(exeResp).find("wps\\:ErrorOccured,ErrorOccured")[0],
                        fehlermeldung = $(exeResp).find("wps\\:Fehlermeldung,Fehlermeldung")[0],
                        exceptionText = $(exeResp).find("ows\\:ExceptionText,ExceptionText")[0],
                        statusInfo = $(data).find("statusInfo")[0],
                        status = $(statusInfo).find("status")[0],
                        message = $(statusInfo).find("message")[0];

                    if (status && status.textContent === "failure") {
                        alert ("Fehler beim Abfragen eines Dienstes. " + message.textContent);
                    }
                    else if (errorOccured && errorOccured.textContent === "Yes") {
                        alert ("Fehler beim Abfragen eines Dienstes. " + fehlermeldung.textContent);
                    }
                    else if (exceptionText) {
                        alert ("Fehler beim Abfragen eines Dienstes. " + exceptionText.textContent);
                    }
                    else {
                        EventBus.trigger("wps:response", {
                            request: this.get("request"),
                            data: data
                        });
                    }
                }
            });
        },
        checkProcesses: function () {
            var rp = this.get("processesRunning");

            if (rp > 0) {
                $("#ladebalken").show();
            }
            else {
                $("#ladebalken").hide();
            }
        }
    });

    return new WPSModel();
});
