
// this.listenTo(Radio.channel("Title"), {
//     "setSize": function () {
//         console.log("listenTO");
//         // this.renderDependingOnSpace();
//     }
// });

export default {
    state: {
        link: "https://geoinfo.hamburg.de",
        toolTip: "Landesbetrieb Geoinformation und Vermessung",
        logo: "https://geofos.fhhnet.stadt.hamburg.de/lgv-config/img/hh-logo.png",
        title: "Masterportal",
        LogoLink: undefined,
        PortalTitle: undefined,
        LogoToolTip: undefined,
        tooltip: undefined,
        PortalLogo: undefined
    },
    mutations: {
        changedTitleWidth (state, newWidth) {
            state.TitleWidth = newWidth;
        }
    }
};
