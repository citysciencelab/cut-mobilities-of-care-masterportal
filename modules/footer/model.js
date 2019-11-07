const FooterModel = Backbone.Model.extend(/** @lends FooterModel.prototype */{
    /**
     * @class FooterModel
     * @extends Backbone.Model
     * @memberof Footer
     * @constructs
     * @property {Array} urls Array of URLs to be displayed in the Footer (defaults to LGV Hamburg)
     * @property {Object} version={} Version of Masterportal to be shown in the footer
     */
    defaults: {
        urls: [
            {
                "bezeichnung": "Kartographie und Gestaltung: ",
                "url": "http://www.geoinfo.hamburg.de/",
                "alias": "Landesbetrieb Geoinformation und Vermessung",
                "alias_mobil": "LGV Hamburg",
                // if a tool should be opened, no url is necessary, provide the id of the dedicated model
                "toolModelId": "sdpdownload"
            }
        ],
        showVersion: false
    }
});

export default FooterModel;
