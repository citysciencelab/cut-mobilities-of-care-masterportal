define([
    "underscore",
    "backbone"
], function (_, Backbone) {

    var Seite1JahrModel = Backbone.Model.extend({
        defaults: {
            maxJahr: "",
            minJahr: "",
            jahr: ""
        },
        initialize: function () {
            if ($("#validjahre")[0] && $("#validjahre")[0].textContent) {
                var splitted = $("#validjahre")[0].textContent.split(/\D/g),
                    filtered = _.filter(splitted, function (val) {
                        var num = parseInt(val);

                        if (_.isNaN(num) === false) {
                            return true;
                        }
                    });

                if (filtered[0] > filtered[1]) {
                    this.set("maxJahr", filtered[0]);
                    this.set("minJahr", filtered[1]);
                }
                else {
                    this.set("maxJahr", filtered[1]);
                    this.set("minJahr", filtered[0]);
                }
            }
            else {
                alert("Fehlendes Element in HTML: validjahre");
            }
        },
        setJahr: function (jahr) {
            jahr = parseInt(jahr);
            if (_.isNaN(jahr) === false && jahr >= this.get("minJahr") && jahr <= this.get("maxJahr")) {
                this.unset("jahr", {silent: true});
                this.set("jahr", jahr);
            }
        }
    });

    return new Seite1JahrModel();
});
