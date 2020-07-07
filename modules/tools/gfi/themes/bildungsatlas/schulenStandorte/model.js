import Theme from "../../model";

const SchulenStandorteViewTheme = Theme.extend(/** @lends SchulenStandorteViewTheme.prototype */{
    defaults: Object.assign({}, Theme.prototype.defaults, {
        // default values to be set for the template
        C_S_Name: "",
        C_S_Str: "",
        C_S_HNr: "",
        C_S_PLZ: "",
        C_S_Ort: "",
        C_S_SI: "nicht vergeben",
        SchPu_PrSt: "",
        C_S_SuS_ES: "",
        C_S_GTA: "",
        C_S_Zweig: "",
        C_S_SuS: "",
        C_S_SuS_PS: "",
        C_S_SuS_S1: "",
        C_S_SuS_S2: "",
        Schule_SuS: "",
        Schule_PS: "",
        Schule_S1: "",
        Schule_S2: "",
        C_S_HomP: ""
    }),
    /**
     * @class SchulenStandorteViewTheme
     * @extends Theme
     * @memberof Tools.GFI.Themes.Bildungsatlas
     * @constructs
     */
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": function () {
                const gfiContent = this.get("gfiContent"),
                    gfiTheme = this.get("gfiTheme"),
                    themeId = this.get("themeId"),
                    layerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, "gfiTheme": gfiTheme, "id": themeId});
                let gfiBildungsatlasFormat = {};

                if (layerList && Array.isArray(layerList) && layerList.length > 0 && layerList[0].get("gfiFormat").gfiBildungsatlasFormat) {
                    gfiBildungsatlasFormat = layerList[0].get("gfiFormat").gfiBildungsatlasFormat;
                    this.setInfoHtml(gfiBildungsatlasFormat);
                }
                else {
                    console.warn("This layer is not existed");
                }

                if (gfiContent) {
                    this.parseGfiContent(gfiContent);
                }
            }
        });
    },

    /**
     * here we need to parse the key and value, so that the real value could be shown in the gfi theme and all the keys will contain underline instead of white space
     * @param  {Object} gfiContent - the attributes from the gfi content
     * @returns {void}
     */
    parseGfiContent: function (gfiContent) {
        const attr = gfiContent.allProperties,
            regex = /\B(?=(\d{3})+(?!\d))/g;

        this.set("schoolName", attr.C_S_Name);
        this.set("streetNo", attr.C_S_Str + " " + attr.C_S_HNr);
        this.set("postCity", attr.C_S_PLZ + " " + attr.C_S_Ort);
        this.set("socialIndex", attr.C_S_SI.toString() === "-1" ? "nicht vergeben" : attr.C_S_SI);
        this.set("hooverSchool", attr.SchPu_PrSt === 0 ? "nein" : "ja");
        this.set("preSchool", attr.C_S_SuS_ES === 0 ? "nein" : "ja");
        this.set("allDaySchool", attr.C_S_GTA === 0 ? "nein" : "ja");
        this.set("schoolWithBranch", attr.C_S_Zweig);
        this.set("countStudentsAll", attr.C_S_SuS.toString().replace(regex, "."));
        this.set("countStudents", (attr.C_S_SuS - attr.C_S_SuS_ES).toString().replace(regex, "."));
        this.set("countStudentsPrimary", attr.C_S_SuS_PS.toString().replace(regex, "."));
        this.set("countStudentsSecondaryOne", attr.C_S_SuS_S1.toString().replace(regex, "."));
        this.set("countStudentsSecondaryTwo", attr.C_S_SuS_S2.toString().replace(regex, "."));
        this.set("countStudentsAllPlace", attr.Schule_SuS.toString().replace(regex, "."));
        this.set("countStudentsPrimaryAllPlace", attr.Schule_PS.toString().replace(regex, "."));
        this.set("countStudentsSecondaryOneAllPlace", attr.Schule_S1.toString().replace(regex, "."));
        this.set("countStudentsSecondaryTwoAllPlace", attr.Schule_S2.toString().replace(regex, "."));
        this.set("schoolUrl", attr.C_S_HomP);
    },

    /**
     * here we need to get the format information to decide which info to show
     * @param  {Object} gfiBildungsatlasFormat - the gfiBildungsatlasFormat of current layer
     * @returns {void}
     */
    setInfoHtml: function (gfiBildungsatlasFormat) {
        let level;

        if (gfiBildungsatlasFormat.themeType) {
            level = gfiBildungsatlasFormat.themeType;
        }

        this.set("level", level);
    }
});

export default SchulenStandorteViewTheme;
