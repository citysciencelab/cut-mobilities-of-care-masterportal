const QuickHelpModel = Backbone.Model.extend(/** @lends QuickHelpModel.prototype */{
    /**
     * @class QuickHelpModel
     * @extends Backbone.Model
     * @memberof QuickHelp
     * @constructs
     * @property {String} imgPath="/" "Path to folder that contains the images for quickHelp".
     * @property {String} searchbarAllgemeines1="allgemein.png" "First image to be displayed in the Quickhelp of the Searchbar under the menu item General (dt. Allgemeines)."
     * @property {String} searchbarAllgemeines2="allgemein2.png" "Second image to be displayed in the Quickhelp of the Searchbar under the menu item General (dt. Allgemeines)."
     * @property {String} searchbarAllgemeines3="allgemein3.png" "Third image to be displayed in the Quickhelp of the Searchbar under the menu item General (dt. Allgemeines)."
     * @property {String} searchbarFlurstueckssuche="allgemein4.png" "Image to be displayed in the Quickhelp of the Searchbar under the menu item parcel search (dt. Flurstückssuche)."
     * @property {String} aufbau1="themen.png" "First image to be displayed in the Quickhelp of the layertree (CustomTree) under the menu item Structure (dt. Aufbau)."
     * @property {String} aufbau2="themen_2.png" "Second image to be displayed in the Quickhelp of the layertree (CustomTree) under the menu item Structure (dt. Aufbau)."
     * @property {String} statistikFlaecheNiemeier="Statistik_Flaeche_Niemeier.png" "First image to be displayed in the quickhelp of the MeasureTool tool under the menu item Statistical Approach (dt. Statistische Annäherung)."
     * @property {String} statistikStreckeUniErlangen="Statistik_Strecke_UniErlangen.png" "Second image to be displayed in the quickhelp of the MeasureTool tool under the menu item Statistical Approach (dt. Statistische Annäherung)."
     * @property {String} utmStreifen="UTM_Streifen.png" "First image to be displayed in the quickhelp of the MeasureTool under the menu item Equalization (dt. Entzerrung) in UTM."
     * @property {String} utmVerzerrung="UTM_Verzerrung.png" "Second image to be displayed in the quickhelp of the MeasureTool under the menu item Equalization (dt. Entzerrung) in UTM."
     * @property {String} utmFormeln="UTM_Formeln.png" "Third image to be displayed in the quickhelp of the MeasureTool under the menu item Equalization (dt. Entzerrung) in UTM."
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
