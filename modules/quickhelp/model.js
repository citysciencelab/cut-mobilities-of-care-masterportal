const QuickHelpModel = Backbone.Model.extend({
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

    initialize: function (attr) {
        if (_.isObject(attr) && _.has(attr, "imgPath")) {
            this.setImgPath(attr.imgPath);
        }
    },

    /*
    * setter for imgPath
    * @param {string} value imgPath
    * @returns {void}
    */
    setImgPath: function (value) {
        this.set("imgPath", value);
    }
});

export default QuickHelpModel;
