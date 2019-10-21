import Theme from "../model";
import ImgView from "../../objects/image/view";
import VideoView from "../../objects/video/view";
import RoutableView from "../../objects/routingButton/view";

const DefaultTheme = Theme.extend({
    initialize: function () {
        var channel = Radio.channel("defaultTheme");

        this.listenTo(this, {
            "change:isReady": function () {
                this.replaceValuesWithChildObjects();
                this.checkRoutable();
            }
        });

        // render gfi new when changing properties of the associated features
        this.listenTo(channel, {
            "changeGfi": function () {
                Radio.trigger("gfiView", "render");
            }
        });
    },

    /**
     * Prüft, ob der Button zum Routen angezeigt werden soll
     * @returns {void}
     */
    checkRoutable: function () {
        if (_.isUndefined(Radio.request("Parser", "getItemByAttributes", {id: "routing"})) === false) {
            if (this.get("routable") === true) {
                this.set("routable", new RoutableView());
            }
        }
    },
    /**
     * Hier werden bei bestimmten Keywords Objekte anstatt von Texten für das template erzeugt. Damit können Bilder oder Videos als eigenständige Objekte erzeugt und komplex
     * gesteuert werden. Im Template werden diese Keywords mit # ersetzt und rausgefiltert. Im view.render() werden diese Objekte attached.
     * Eine leidige Ausnahme bildet z.Z. das Routing, da hier zwei features des Reisezeitenlayers benötigt werden. (1. Ziel(key) mit Dauer (val) und 2. Route mit ol.geom (val).
     * Das Auswählen der richtigen Werte für die Übergabe erfolgt hier.
     * @returns {void}
     */
    replaceValuesWithChildObjects: function () {
        var element = this.get("gfiContent"),
            children = [];

        if (_.isString(element) && element.match(/content="text\/html/g)) {
            children.push(element);
        }
        else {
            _.each(element, function (ele, index) {
                _.each(ele, function (val, key) {
                    var copyright,
                        imgView,
                        videoView,
                        valString = String(val);

                    if (valString.substr(0, 4) === "http"
                        && (valString.search(/\.jpg/i) !== -1 || valString.search(/\.png/i) !== -1 || valString.search(/\.jpeg/i) !== -1 || valString.search(/\.gif/i) !== -1)) {
                        // Prüfen, ob es auch ein Copyright für das Bild gibt, dann dieses ebenfalls an ImgView übergeben, damit es im Bild dargestellt wird
                        copyright = "";

                        if (element[index].Copyright !== null) {
                            copyright = element[index].Copyright;
                            element[index].Copyright = "#";
                        }
                        else if (element[index].copyright !== null) {
                            copyright = element[index].copyright;
                            element[index].copyright = "#";
                        }

                        imgView = new ImgView(valString, copyright);

                        element[index][key] = "#";

                        children.push({
                            key: imgView.model.get("id"),
                            val: imgView,
                            type: "image"
                        });
                    }
                    else if (key === "video" && Radio.request("Util", "isAny") === null) {
                        videoView = new VideoView(valString, "rtmp/mp4", "400px", "300px");

                        element[index][key] = "#";
                        children.push({
                            key: videoView.model.get("id"),
                            val: videoView,
                            type: "video"
                        });
                        if (_.has(element, "mobil_video")) {
                            element.mobil_video = "#";
                        }
                    }
                    else if (key === "mobil_video" && Radio.request("Util", "isAny")) {
                        videoView = new VideoView(valString, "application/x-mpegURL", "300px", "300px");

                        element[index][key] = "#";
                        children.push({
                            key: videoView.model.get("id"),
                            val: videoView,
                            type: "mobil_video"
                        });
                        if (_.has(element, "video")) {
                            element.video = "#";
                        }
                    }
                    // lösche leere Dummy-Einträge wieder raus.
                    element[index] = _.omit(element[index], function (value) {
                        return value === "#";
                    });
                }, this);
            });
        }
        if (children.length > 0) {
            this.set("children", children);
        }
        this.set("gfiContent", element);
    }
});

export default DefaultTheme;
