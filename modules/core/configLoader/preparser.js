import DefaultTreeParser from "./parserDefaultTree";
import CustomTreeParser from "./parserCustomTree";

const Preparser = Backbone.Model.extend({
    defaults: {},
    url: function () {
        var path = _.has(Config, "portalConf") === true ? Config.portalConf : "config.json",
            addPath,
            isAddPathValid;

        if (path.slice(-6) === "?noext") {
            path = Config.portalConf;
        }
        else if (path.slice(-5) !== ".json") {
            addPath = Radio.request("Util", "getConfig");
            isAddPathValid = addPath.length > 1;
            // removes trailing "/" from path and leading "/" from urlparam "config". unions string using "/"

            if (isAddPathValid) {
                if (path.slice(-1) === "/") {
                    path = path.slice(0, -1);
                }
                if (addPath.slice(0, 1) === "/") {
                    addPath = addPath.slice(1);
                }
                path = path + "/" + addPath;
            }
            else {
                path = "config.json";
            }
        }

        return path;
    },
    initialize: function () {
        this.fetch({async: false,
            error: function () {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Das Portal konnte leider nicht geladen werden!</strong> <br> " +
                        "<small>Details: Das Portal kann \"config.json\" unter dem angegebenen Pfad nicht finden.</small>",
                    kategorie: "alert-warning"
                });
            }
        });
    },
    parse: function (response) {
        var attributes = {
            portalConfig: response.Portalconfig,
            baselayer: response.Themenconfig.Hintergrundkarten,
            overlayer: response.Themenconfig.Fachdaten,
            overlayer_3d: response.Themenconfig.Fachdaten_3D,
            treeType: response.Portalconfig.Baumtyp,
            isFolderSelectable: this.parseIsFolderSelectable(_.property(["tree", "isFolderSelectable"])(Config)),
            snippetInfos: this.requestSnippetInfos()
        };

        if (attributes.treeType === "default") {
            new DefaultTreeParser(attributes);
        }
        else {
            new CustomTreeParser(attributes);
        }
    },

    parseIsFolderSelectable: function (globalFlag) {
        if (globalFlag === false) {
            return false;
        }
        return true;
    },

    requestSnippetInfos: function () {
        var infos,
            url;

        if (_.has(Config, "infoJson")) {
            url = Config.infoJson;
        }

        if (!_.isUndefined(url)) {
            $.ajax({
                url: url,
                async: false,
                success: function (data) {
                    infos = data;
                }
            });
        }
        return infos;
    }
});

export default Preparser;
