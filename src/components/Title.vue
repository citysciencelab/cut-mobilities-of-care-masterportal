<script>
export default {
    mounted () {
        $(this.$el).insertAfter(document.getElementById("root"));
    },
    methods: {
        /**
         * Checks whether deprecated parameters have been defined in the config.json.
         * If this is the case, these values are read out and written into the store.
         * @param {string} [deprecatedParameter] - name of the deprecated parameter.
         * @returns {String} - returns the parametervalues.
         */
        getDeprecatedParameters (deprecatedParameter) {
            const deprecatedVsNew = {
                PortalTitle: "title",
                LogoLink: "link",
                LogoToolTip: "toolTip",
                tooltip: "toolTip",
                PortalLogo: "logo"
            }

            if (this.$store.state.Title[deprecatedParameter] !== undefined) {
                console.warn(
                    "Attribute '" + deprecatedParameter + "' is deprecated. Please use Object 'portalTitle' and the attribute '"
                    + deprecatedVsNew[deprecatedParameter] + "' instead."
                );
                return this.$store.state.Title[deprecatedParameter];
            }
            return undefined;
        },
            
        /**
        * Renders the title if enough space available.
        * @returns {void}
        */
        renderDependingOnSpace: function () {
            let menueBreite,
                sucheBreite,
                gesamtBreite,
                platzFuerTitel,
                // navMenuWidth,
                // searchbarWidth,
                // navBarWidth,
                titleWidth,
                rest,
                doRender = false;
            const titleElement = document.getElementsByClassName("portal-title"),
                titlePadding = 10;

            if (document.getElementById("searchbar")) {
                menueBreite = document.getElementById("root").offsetWidth;
                sucheBreite = document.getElementById("searchForm").offsetWidth + 40; // add width of searchbarIcon
                gesamtBreite = document.getElementById("main-nav").offsetWidth;
                // navMenuWidth = document.getElementById("root").offsetWidth;
                // searchbarWidth = document.getElementById("searchForm").offsetWidth + 40; // add width of searchbarIcon
                // navBarWidth = document.getElementById("main-nav").offsetWidth;
                console.log(titleElement);
                titleWidth = titleElement ? titleElement[0].offsetWidth : 0; // Ermittlung wie breit der Titel eigentlich ist.

                platzFuerTitel = gesamtBreite - menueBreite - sucheBreite;
                console.log(platzFuerTitel, this.$store.state.Title.titleWidth);

                // Fall 1: volle Breite, alle Elemente können nebeneinander bestehen. Keine Einschränkungen.
                if (platzFuerTitel > this.$store.state.Title.titleWidth) {
                    console.log(titleElement[0].style.display);
                    // wenn wieder genug Platz vorhanden sein sollte, so werden die vormals ausgeblendeten Titleelmente wieder eingeblendet.
                    if (!titleElement) {
                        console.log("nope");
                        titleElement[0].style.display = "visible";
                    }
                    console.log(titleElement[0].style.display);
                }

                // Fall 2: Eingeschränkte Breite, es passt nur noch das Logo. Der Titel-Text wird ausgeblendet.
                // if (platzFuerTitel < this.$store.state.Title.titleWidth) {

                // }

                // Fall 3: Stark eingeschränkte Breite. Titel und Logo sind nicht mehr zu sehen. Sie werden beide ausgeblendet.
                else if (platzFuerTitel < titleWidth) {
                    console.log(titleElement);                
                    this.$store.state.Title.titleWidth = titleWidth;
                    document.getElementsByClassName("portal-title")[0].remove();
                }
            }
        }

        //         if (!this.$store.state.Title.titleWidth) { // Ist die Breite des Titels bereits im Store enthalten?
        //             console.log(titleWidth);
        //             if (titleWidth > titlePadding) {
        //                 this.$store.state.Title.titleWidth = titleWidth;
        //                 this.$nextTick(() => {
        //                     document.getElementById("titleText").style.width = toString(titleWidth) + "px";
        //                     // document.getElementById("titleText").style.fontSize = "2px";
        //                     console.log("Tick2");
        //                 });
        //                 this.$el.style.fontSize = titleWidth;
        //                 console.log(this.$el);
        //             }
        //         }
        //         else if (titleWidth > this.$store.state.Title.titleWidth) {
        //             this.$store.state.Title.titleWidth = titleWidth;
        //             console.log(this.$el);
        //             this.$nextTick(() => {
        //                 document.getElementById("titleText").style.width = toString(titleWidth) + "px";
        //                 // document.getElementById("titleText").style.fontSize = "2px";
        //                 console.log("Tick1");
        //             });
        //             // this.$el.style.width = titleWidth;
        //         }
        //         else {
        //             titleWidth = this.$store.state.Title.titleWidth;
        //         }
        //         console.log(navBarWidth, navMenuWidth, searchbarWidth);
        //         rest = navBarWidth - navMenuWidth - searchbarWidth;

        //         // check if title is smaller than the rest: set new width at el to visualize ... at the end of the title
        //         if ((rest - titleWidth) < 0 && rest > 0 && (rest - titleWidth) > -(titleWidth - 30)) {
        //             console.log("rest:", rest);
        //             console.log(this.$el);
        //             console.log('document.getElementsByClassName("portal-title");:', document.getElementsByClassName("portal-title"));
        //             document.getElementsByClassName("portal-title")[0].style.width = 500;
        //             doRender = true;
        //         }
        //         else if (titleWidth > 0) {
        //             this.$nextTick(() => {
        //                 document.getElementById("titleText").style.width = toString(titleWidth) + "px";
        //                 // document.getElementById("titleText").style.fontSize = "2px";
        //                 console.log("Tick");
        //             });
        //         }
        //         if (doRender) {
        //             // this.render();
        //         }
        //         else if (titleWidth < rest && rest > 50) {
        //             // this.render();
        //         }
        //         else {
        //             this.$el.style.width = 0;
        //             // reset width at title, else the header may be wrapped
        //             this.$el.css("width", "auto");
        //         }
        //     }
        //     $(this.$el).insertAfter(document.getElementById("root"));
        //     this.$store.commit('changedTitleWidth', 10);
        //     console.log(this.$store.state.Title);
        // },
        // /**
        // * Render function for title.
        // * @returns {void}
        // */
        // render: function () {
        //     const attr = this.model.toJSON();

        //     this.$el.html(this.template(attr));
        //     $(".nav-menu").after(this.$el);

        //     return this;
        // }
    },
    computed: {
        /**
        * LogoLink
        * @deprecated in 3.0.0
        */
        link () {
            const deprecatedParameter = this.getDeprecatedParameters('LogoLink');

            return ((deprecatedParameter === undefined) ? this.$store.state.Title.link : deprecatedParameter);
        },
        /**
        * LogoToolTip
        * @deprecated in 3.0.0
        * tooltip
        * @deprecated in 3.0.0
        */
        toolTip () {
            const deprecatedParameter = ((this.getDeprecatedParameters('LogoToolTip') === undefined) ? this.getDeprecatedParameters('tooltip') : deprecatedParameter);

            return ((deprecatedParameter === undefined) ? this.$store.state.Title.toolTip : deprecatedParameter);
        },
        /**
        * LogoLink
        * @deprecated in 3.0.0
        */
        logo () {
            const deprecatedParameter = this.getDeprecatedParameters('PortalLogo');
            this.$store.watch(
                (state) => state.Title.TitleWidth, test => {console.log("changes")});

            
            return ((deprecatedParameter === undefined) ? this.$store.state.Title.logo : deprecatedParameter);
        },
        /**
        * PortalTitle
        * @deprecated in 3.0.0
        */
        title () {
            const deprecatedParameter = this.getDeprecatedParameters('PortalTitle');

            return ((deprecatedParameter === undefined) ? this.$store.state.Title.title : deprecatedParameter);
        }
    },
    created () {
        const that = this,
            myBus = Backbone.Events;

        myBus.listenTo(Radio.channel("Title"), {
            "setSize": function () {
                console.log("listenTo");
                that.renderDependingOnSpace();
            }
        })

        // console.log(this.$store.state);
        // this.$store.subscribe((mutation, state) => {
        //     console.log(mutation.type);
        //     if (mutation.type === "changedTitleWidth") {
        //         console.log(`Updating to ${state.TitleWidth}`)
        //     }
        // })
        // this.$store.watch(
        //     (state, getters) => getters.TitleWidth,
        //     (newValue, oldValue) => {
        //         console.log('Updating from ${oldValue} to ${newValue}');
        //     }
        // )
        // this.$store.commit('changedTitleWidth', 10);
        // this.$store.commit('changedTitleWidth', 6);
    }
    // updated: function () {
    //     this.$nextTick(function () {
    //         this.renderDependingOnSpace();
    //     })
    // },
    // watch: {
    //     TitleWidth: function () {
    //         console.log("Hello");
    //     }
    // }
}
    console.log(document.getElementById("searchbar"));
</script>

<template>
    <div class="portal-title">
        <a :href="link" target="_blank" :data-toggle="title" data-placement="bottom" :title="toolTip">
            <img :src="logo">
            <span id="titleText">
                {{ title }}
            </span>
        </a>
    </div>
</template>

<style lang="less" scoped>
@color_1: rgb(51,51,51);
@font_family_1: 'MasterPortalFont','Arial Narrow',Arial,sans-serif;

.portal-title {
    margin-left: 10px;
    overflow: hidden;
    line-height: 50px;
    float: left;
    a {
        text-decoration: none;
        display: block;
        img {
            margin: 0 5px 0 5px;
            max-height: 40px;
            display: inline-block;
            vertical-align: middle;
        }
        span {
            color: @color_1;
            margin-left: 5px;
            font-size: 26px;
            font-family: @font_family_1;
            white-space: nowrap;
            text-overflow: ellipsis;
            display: inline-block;
            vertical-align: middle;
        }
    }
}

</style>