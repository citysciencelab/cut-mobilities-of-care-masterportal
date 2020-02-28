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
            
        // /**
        // * Renders the title if enough space available.
        // * @returns {void}
        // */
        // renderDependingOnSpace: function () {
        //     let menueBreite,
        //         sucheBreite,
        //         gesamtBreite,
        //         platzFuerTitel,
        //         // navMenuWidth,
        //         // searchbarWidth,
        //         // navBarWidth,
        //         titleWidth,
        //         rest,
        //         doRender = false;
        //     const titleElement = document.getElementsByClassName("portal-title"),
        //         titlePadding = 10;

        //     if (document.getElementById("searchbar")) {
        //         menueBreite = document.getElementById("root").offsetWidth;
        //         sucheBreite = document.getElementById("searchForm").offsetWidth + 40; // add width of searchbarIcon
        //         gesamtBreite = document.getElementById("main-nav").offsetWidth;
        //         // navMenuWidth = document.getElementById("root").offsetWidth;
        //         // searchbarWidth = document.getElementById("searchForm").offsetWidth + 40; // add width of searchbarIcon
        //         // navBarWidth = document.getElementById("main-nav").offsetWidth;
        //         console.log(titleElement);
        //         titleWidth = titleElement ? titleElement[0].offsetWidth : 0; // Ermittlung wie breit der Titel eigentlich ist.
        //         this.$store.state.Title.titleWidth = titleWidth;

        //         platzFuerTitel = gesamtBreite - menueBreite - sucheBreite;
        //         console.log(platzFuerTitel, this.$store.state.Title.titleWidth);

        //         // Fall 1: volle Breite, alle Elemente können nebeneinander bestehen. Keine Einschränkungen.
        //         if (platzFuerTitel > this.$store.state.Title.titleWidth) {
        //             console.log(titleElement[0].style.display);
        //             // wenn wieder genug Platz vorhanden sein sollte, so werden die vormals ausgeblendeten Titleelmente wieder eingeblendet.
        //             if (!titleElement) {
        //                 console.log("nope");
        //                 titleElement[0].style.display = "visible";
        //             }
        //             console.log(titleElement[0].style.display);
        //         }

        //         // Fall 2: Eingeschränkte Breite, es passt nur noch das Logo. Der Titel-Text wird ausgeblendet.
        //         // if (platzFuerTitel < this.$store.state.Title.titleWidth) {

        //         // }

        //         // Fall 3: Stark eingeschränkte Breite. Titel und Logo sind nicht mehr zu sehen. Sie werden beide ausgeblendet.
        //         else if (platzFuerTitel < titleWidth) {
        //             console.log(titleElement);                
        //             document.getElementsByClassName("portal-title")[0].remove();
        //         }
        //     }
        // }
    // },

        /**
        * Renders the title if enough space available.
        * @returns {void}
        */
        renderDependingOnSpace: function () {
            let navMenuWidth,
                searchbarWidth,
                navBarWidth,
                titleWidth,
                rest,
                doRender = false;
            const searchBarIconEl = document.getElementById("searchbar"),
                titleEl = document.getElementById("portalTitle"),
                titlePadding = 10;

            if (document.getElementById("searchbar")) {
                navMenuWidth = document.getElementById("root").offsetWidth;
                searchbarWidth = document.getElementById("searchForm").offsetWidth + searchBarIconEl.offsetWidth;
                navBarWidth = document.getElementById("main-nav").offsetWidth;
                titleWidth = titleEl ? titleEl.offsetWidth : 0;
                this.$store.state.Title.titleWidth = titleWidth;
                if (!this.$store.state.Title.titleWidth) {
                    if (titleWidth > titlePadding) {
                        this.$store.state.Title.titleWidth = titleWidth;
                        this.$el.width(titleWidth);
                    }
                }
                else if (titleWidth > this.$store.state.Title.titleWidth) {
                    this.$store.state.Title.titleWidth = titleWidth;
                    this.$el.width(titleWidth);
                }
                else {
                    titleWidth = this.$store.state.Title.titleWidth;
                }
                rest = navBarWidth - navMenuWidth - searchbarWidth;

                // check if title is smaller than the rest: set new width at el to visualize ... at the end of the title
                if ((rest - titleWidth) < 0 && rest > 0 && (rest - titleWidth) > -(titleWidth - 30)) {
                    this.$el.width(rest);
                    doRender = true;
                }
                else if (titleWidth > 0) {
                    this.$el.width(titleWidth);
                }
                if (doRender) {
                    console.log("X)");
                    this.render();
                }
                else if (titleWidth < rest && rest > 50) {
                    this.render();
                    console.log("Y");
                }
                else {
                    console.log(this.$el);
                    this.$el.style.display = 'none';
                    // reset width at title, else the header may be wrapped
                    this.$el.style.width = "auto";
                }
            }
        },
        /**
        * Render function for title.
        * @returns {void}
        */
        render: function () {
            const attr = this.$store.state.Title;
            console.log(attr);
            console.log(this.$el);
            this.$el.style.display = 'block';
            // this.$el.html(this.template(attr));

            return this;
        }
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
</script>

<template>
    <div class="portal-title">
        <a :href="link" target="_blank" :data-toggle="title" data-placement="bottom" :title="toolTip">
            <img :src="logo">
            <span v-html="title"/>
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