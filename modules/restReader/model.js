define([
    "underscore",
    "backbone",
    "eventbus"
], function (_, Backbone, EventBus) {
    "use strict";
    var restService = Backbone.Model.extend({
        defaults: {

        },
        initialize: function () {
            if (this.get('url')) {
                var newURL;
                // Umwandeln der diensteAPI-URLs in lokale URL gemäß httpd.conf
                if (this.get("url").indexOf("http://WSCA0620.fhhnet.stadt.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://WSCA0620.fhhnet.stadt.hamburg.de", "/wsca0620");
                }
                else if (this.get("url").indexOf("http://bsu-ims.fhhnet.stadt.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://bsu-ims.fhhnet.stadt.hamburg.de", "/bsu-ims");
                }
                else if (this.get("url").indexOf("http://bsu-ims") !== -1) {
                    newURL = this.get("url").replace("http://bsu-ims", "/bsu-ims");
                }
                else if (this.get("url").indexOf("http://bsu-uio.fhhnet.stadt.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://bsu-uio.fhhnet.stadt.hamburg.de", "/bsu-uio");
                }
                else if (this.get("url").indexOf("http://geofos.fhhnet.stadt.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://geofos.fhhnet.stadt.hamburg.de", "/geofos");
                }
                else if (this.get("url").indexOf("http://geofos") !== -1) {
                    newURL = this.get("url").replace("http://geofos", "/geofos");
                }
                else if (this.get("url").indexOf("http://wscd0095") !== -1) {
                    newURL = this.get("url").replace("http://wscd0095", "/geofos");
                }
                else if (this.get("url").indexOf("http://hmbtg.geronimus.info") !== -1) {
                    newURL = this.get("url").replace("http://hmbtg.geronimus.info", "/hmbtg");
                }
                else if (this.get("url").indexOf("http://lgvfds01.fhhnet.stadt.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://lgvfds01.fhhnet.stadt.hamburg.de", "/lgvfds01");
                }
                else if (this.get("url").indexOf("http://lgvfds02.fhhnet.stadt.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://lgvfds02.fhhnet.stadt.hamburg.de", "/lgvfds02");
                }
                else if (this.get("url").indexOf("http://wsca0620.fhhnet.stadt.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://wsca0620.fhhnet.stadt.hamburg.de", "/wsca0620");
                }
                else if (this.get("url").indexOf("http://wscd0096") !== -1) {
                    newURL = this.get("url").replace("http://wscd0096", "/wscd0096");
                }
                // ab hier Internet
    			else if (this.get("url").indexOf("http://extmap.hbt.de") !== -1) {
                    newURL = this.get("url").replace("http://extmap.hbt.de", "/extmap");
                }
    			else if (this.get("url").indexOf("http://gateway.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://gateway.hamburg.de", "/gateway-hamburg");
                }
    			else if (this.get("url").indexOf("http://geodienste-hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://geodienste-hamburg.de", "/geodienste-hamburg");
                }
                else {
                    newURL = this.get("url");
                }

                this.set("url", newURL);
            }
        }
    });
    return restService;
});
