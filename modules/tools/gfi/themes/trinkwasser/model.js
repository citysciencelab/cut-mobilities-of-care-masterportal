import Theme from "../model";

const TrinkwasserTheme = Theme.extend({

    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.splitContent
        });
    },
    splitContent: function () {
        const allgemContent = {},
            mikrobioContent = {},
            chemContent = {};

        if (this.get("gfiContent") !== undefined) {
            const gfiContent = Array.isArray(this.get("gfiContent")) ? this.get("gfiContent") : [this.get("gfiContent")];

            gfiContent.forEach(element => {
                Object.entries(element).forEach(ele => {
                    const value = ele[1],
                        key = ele[0];

                    if (["Entnahmedatum", "Bezirk", "Stadtteil", "Versorgungsgebiet"].includes(key)) {
                        allgemContent[key] = value;
                    }
                    else if (["Coliforme Bakterien", "Coliforme Bakterien MPN", "Escherichia coli", "Escherichia coli (E.coli) MPN", "Koloniezahl, 36°C", "Koloniezahl, 20°C", "intestinale Enterokokken", "Coliforme Bakterien Grenzwertwarnung", "Coliforme Bakterien MPN Grenzwertwarnung", "Escherichia coli Grenzwertwarnung", "Escherichia coli (E.coli) MPN Grenzwertwarnung", "Koloniezahl, 36°C Grenzwertwarnung", "Koloniezahl, 20°C Grenzwertwarnung", "intestinale Enterokokken Grenzwertwarnung"].includes(key)) {
                        mikrobioContent[key] = value;
                    }
                    else {
                        chemContent[key] = value;
                    }
                });
            });

            this.set("gfiContent", {"allgemContent": allgemContent, "mikrobioContent": mikrobioContent, "chemContent": chemContent});
        }
    }
});

export default TrinkwasserTheme;
