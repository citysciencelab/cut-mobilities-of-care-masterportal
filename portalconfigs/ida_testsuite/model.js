define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Model;

    Model = Backbone.Model.extend({
        sendRequest: function () {
            this.trigger("requestStart");
            $.ajax({
                url: Radio.request("Util", "getProxyURL", "http://wfalgqa003.dpaorins.de/deegree-wps/services/wps?Request=Execute&Service=WPS&Version=1.0.0"),
                data: this.get("payload"),
                context: this,
                type: "POST",
                headers: {
                    "Content-Type": "text/xml; charset=UTF-8"
                },
                success: function (response) {
                    var exeResp = $("wps\\:ExecuteResponse,ExecuteResponse", response),
                        data = $(exeResp).find("wps\\:value,value")[0];

                    this.setActualValue(parseFloat($(data).text(), 10));
                },
                error: function (err) {
                    var detail = err.statusText && err.statusText !== "" ? err.statusText : "";

                    this.setActualValue(detail);
                },
                complete: function () {
                    this.collection.updateProgressBar();
                    this.trigger("requestReady");
                }
            });
        },

        setActualValue: function (value) {
            this.set("actualValue", value);
        },

        getActualValue: function () {
            return this.get("actualValue");
        },

        getGivenValue: function () {
            return this.get("soll");
        }
    });

    return Model;
});
