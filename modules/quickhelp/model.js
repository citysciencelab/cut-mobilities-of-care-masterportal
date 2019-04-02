const QuickHelpModel = Backbone.Model.extend(/** @lends QuickHelpModel.prototype */{
    defaults: {
        imgPath: "/",
        allgemein: "allgemein.png",
        allgemein2: "allgemein_2.png",
        allgemein3: "allgemein_3.png",
        allgemein4: "allgemein_4.png",
        themen: "themen.png",
        themen2: "themen_2.png",
        statistikFlaecheNiemeier: "Statistik_Flaeche_Niemeier.png",
        statistikStreckeUniErlangen: "Statistik_Strecke_UniErlangen.png",
        utmStreifen: "UTM_Streifen.png",
        utmVerzerrung: "UTM_Verzerrung.png",
        utmFormeln: "UTM_Formeln.png"
    },

    /**
     * @class QuickHelpModel
     * @extends Backbone.Model
     * @memberof Quickhelp
     * @constructs
     * @property {String} imgPath="/"
     * @property {String} allgemein="allgemein.png"
     * @property {String} allgemein2="allgemein2.png"
     * @property {String} allgemein3="allgemein3.png"
     * @property {String} allgemein4="allgemein4.png"
     * @property {String} themen="themen.png"
     * @property {String} themen2="themen_2.png"
     * @property {String} statistikFlaecheNiemeier="Statistik_Flaeche_Niemeier.png"
     * @property {String} statistikStreckeUniErlangen="Statistik_Strecke_UniErlangen.png"
     * @property {String} utmStreifen="UTM_Streifen.png"
     * @property {String} utmVerzerrung="UTM_Verzerrung.png"
     * @property {String} utmFormeln="UTM_Formeln.png"
     * @param {boolean | object} attr Configuration
     */
    initialize: function (attr) {
        if (_.isObject(attr) && _.has(attr, "imgPath")) {
            this.setImgPath(attr.imgPath);
        }
    },

    /**
    * setter for imgPath
    * @param {string} value imgPath
    * @returns {void}
    */
    setImgPath: function (value) {
        this.set("imgPath", value);
    }
});

export default QuickHelpModel;
