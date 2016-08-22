define([
    "backbone",
    "eventbus",
    "modules/alerting/view",
    "idaModules/wps/model"
], function (Backbone, EventBus) {
    "use strict";
    var DownloadModel = Backbone.Model.extend({
        defaults: {
            fileid: "", // PDF-Name
            downloadpath: "", // vollständiger Pfad nach kopieren
            wpsIDADownload: "IDADownload",
            result: "",
            error: "",
            fehlermeldung: "",
            filepath: "",
            params: ""
        },
        initialize: function () {
            EventBus.on("wps:response", this.handlePDFCopy, this); // Result von wpsIDADownload
        },
        /*
        * stellt Request zum Kopieren der PDF in den öffentlichen Bereich bereit
        */
        copyPDF: function () {
            EventBus.trigger("wps:request", {
                workbenchname: this.get("wpsIDADownload"),
                dataInputs: "<wps:DataInputs><wps:Input><ows:Identifier>fileid</ows:Identifier><wps:Data><wps:LiteralData dataType='string'>" + this.get("fileid") + "</wps:LiteralData></wps:Data></wps:Input></wps:DataInputs>"
            });
        },
        /*
        * Übergibt das Ergebnis an die View
        */
        handlePDFCopy: function (obj) {
            if (obj.request.workbenchname === this.get("wpsIDADownload")) {
                var result = $(obj.data).find("wps\\:ergebnis,ergebnis") ? $(obj.data).find("wps\\:ergebnis,ergebnis")[0].textContent : "",
                    fehlermeldung = $(obj.data).find("wps\\:Fehlermeldung,Fehlermeldung")[0] ? $(obj.data).find("wps\\:Fehlermeldung,Fehlermeldung")[0].textContent : "",
                    filepath = $(obj.data).find("wps\\:filepath,filepath")[0] ? $(obj.data).find("wps\\:filepath,filepath")[0].textContent : "",
                    params = $(obj.data).find("wps\\:eingabeparameter,eingabeparameter")[0] ? $(obj.data).find("wps\\:eingabeparameter,eingabeparameter")[0] : "";

                if (result !== "") {
                    this.set("downloadpath", filepath);
                    this.set("result", result);
                }
                else if (fehlermeldung !== "") {
                    this.set("fehlermeldung", result);
                }
            }
        }
    });

    return new DownloadModel();
});
