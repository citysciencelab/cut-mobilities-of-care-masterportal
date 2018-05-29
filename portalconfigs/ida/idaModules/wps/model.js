define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        WPSModel;

    WPSModel = Backbone.Model.extend({
        defaults: {
            url: "",
            request: "",
            processesRunning: 0
        },
        initialize: function () {
            var channel = Radio.channel("WPS");

            channel.on({
                "request": this.request
            }, this);

            try {
                var resp = Radio.request("RestReader", "getServiceById", Config.wpsID),
                    newURL = Radio.request("Util", "getProxyURL", resp.get("url"));

                this.set("url", newURL);
                this.listenTo(this, "change:processesRunning", this.checkProcesses);
            }
            catch (err) {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Fehler beim Initialisieren des WPS-Modul.</strong> " +
                        "Dies deutet auf einen schwerwiegendes Problem hin. Bitte nehmen Sie Kontakt mit uns auf (Kontaktformular).",
                    kategorie: "alert-danger",
                    position: "center-center"
                });
            }
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
                    if (jqXHR.status !== 200) {
                        Radio.trigger("Alert", "alert", {
                            text: "<strong>Ihre Datenabfrage wurde fehlerhaft bearbeitet.</strong> " +
                                "Bitte führen Sie Ihre letzte Aktion erneut aus. Gehen Sie hierfür ggf. einen Schritt zurück.",
                            kategorie: "alert-danger",
                            position: "center-center"
                        });
                    }
                },
                success: function (response) {
                    var exeResp = $("wps\\:ExecuteResponse,ExecuteResponse", response),
                        data = $(exeResp).find("wps\\:ComplexData,ComplexData")[0],
                        errorOccured = $(exeResp).find("wps\\:ErrorOccured,ErrorOccured")[0],
                        exceptionText = $(exeResp).find("ows\\:ExceptionText,ExceptionText")[0],
                        statusInfo = $(data).find("statusInfo")[0],
                        status = $(statusInfo).find("status")[0];

                    if (status && status.textContent === "failure") {
                        Radio.trigger("Alert", "alert", {
                            text: "<strong>Ihre Datenabfrage wurde fehlerhaft bearbeitet.</strong> " +
                                "Dies deutet auf einen schwerwiegendes Problem hin. Bitte nehmen Sie Kontakt mit uns auf (Kontaktformular).",
                            kategorie: "alert-danger",
                            position: "center-center"
                        });
                    }
                    else if (errorOccured && errorOccured.textContent === "Yes") {
                        Radio.trigger("Alert", "alert", {
                            text: "<strong>Ihre Datenabfrage wurde fehlerhaft bearbeitet.</strong> " +
                                "Bitte führen Sie Ihre letzte Aktion erneut aus. Gehen Sie hierfür ggf. einen Schritt zurück.",
                            kategorie: "alert-danger",
                            position: "center-center"
                        });
                    }
                    else if (exceptionText) {
                        Radio.trigger("Alert", "alert", {
                            text: "<strong>Ihre Datenabfrage wurde fehlerhaft bearbeitet.</strong> " +
                                "Dies deutet auf einen schwerwiegendes Problem hin. Bitte nehmen Sie Kontakt mit uns auf (Kontaktformular).",
                            kategorie: "alert-danger",
                            position: "center-center"
                        });
                    }
                    else {
                        Radio.trigger("Alert", "alert:remove");
                        Radio.trigger("WPS", "response", {
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

    return WPSModel;
});
