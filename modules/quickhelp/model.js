const QuickHelpModel = Backbone.Model.extend(/** @lends QuickHelpModel.prototype */{
    /**
     * @class QuickHelpModel
     * @extends Backbone.Model
     * @memberof QuickHelp
     * @constructs
     * @property {String} imgPath="/" "todo"
     * @property {String} allgemein="allgemein.png" "todo"
     * @property {String} allgemein2="allgemein2.png" "todo"
     * @property {String} allgemein3="allgemein3.png" "todo"
     * @property {String} allgemein4="allgemein4.png" "todo"
     * @property {String} themen="themen.png" "todo"
     * @property {String} themen2="themen_2.png" "todo"
     * @property {String} statistikFlaecheNiemeier="Statistik_Flaeche_Niemeier.png" "todo"
     * @property {String} statistikStreckeUniErlangen="Statistik_Strecke_UniErlangen.png" "todo"
     * @property {String} utmStreifen="UTM_Streifen.png" "todo"
     * @property {String} utmVerzerrung="UTM_Verzerrung.png" "todo"
     * @property {String} utmFormeln="UTM_Formeln.png" "todo"
     * @param {boolean | object} attr Configuration
     */
    defaults: {
        imgPath: "/",
        searchbarAllgemeines1: "allgemein.png",
        searchbarAllgemeines2: "allgemein_2.png",
        searchbarAllgemeines3: "allgemein_3.png",
        searchbarFlurstueckssuche: "allgemein_4.png",
        aufbau1: "themen.png",
        aufbau2: "themen_2.png",
        statistikFlaecheNiemeier: "Statistik_Flaeche_Niemeier.png",
        statistikStreckeUniErlangen: "Statistik_Strecke_UniErlangen.png",
        utmStreifen: "UTM_Streifen.png",
        utmVerzerrung: "UTM_Verzerrung.png",
        utmFormeln: "UTM_Formeln.png"
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
