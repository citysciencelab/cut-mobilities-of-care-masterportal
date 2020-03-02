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
        * Depending on the available space, the titletext and titlelogo is rendered.
        * @returns {void}
        */
        renderDependingOnSpace: function () {
            let navMenuWidth,
                searchbarWidth,
                navBarWidth,
                titleWidth,
                titleTextWidth,
                rest,
                logo,
                doRender = false;
            const titleEl = document.getElementsByClassName("portal-title"),
                titlePadding = 10;
            
            this.$el.style.display = "block";
            document.getElementById('title-text').style.display = 'inline-block';

            if (document.getElementById("searchbar")) {
                navMenuWidth = document.getElementById("root").offsetWidth;
                searchbarWidth = document.getElementById("searchbar").offsetWidth;
                navBarWidth = document.getElementById("main-nav").offsetWidth;
                titleTextWidth = document.getElementById("title-text").offsetWidth;
                logo = document.getElementById("logo").offsetWidth;
                titleWidth = titleEl ? titleEl[0].offsetWidth : 0;

                if (!this.$store.state.Title.titleWidth) {
                    if (titleWidth > titlePadding) {
                        this.$store.state.Title.titleWidth = titleWidth;
                    }
                }

                rest = navBarWidth - navMenuWidth - searchbarWidth;
                document.getElementById("title-text").style.width = (rest - logo - titlePadding).toString() + "px";

                if (logo < rest && this.$el.style.display === 'none') {
                    this.$el.style.display = 'block';
                }
                else if (rest < logo && this.$el.style.display === "block") {
                    this.$el.style.display = 'none';
                }
                if (rest - titleTextWidth - logo - titlePadding < (30/titleTextWidth * 100) - titleTextWidth && document.getElementById('title-text').style.display === 'inline-block') {
                    document.getElementById('title-text').style.display = 'none';
                }
                else if (rest - titleTextWidth - logo - titlePadding > (30/titleTextWidth * 100) && document.getElementById('title-text').style.display === 'none') {
                    document.getElementById('title-text').style.display = 'inline-block';
                }
            }
        },
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
                setTimeout(function() {
                    that.renderDependingOnSpace();
                }, 500);
            }
        })
    }
}
</script>

<template>
    <div class="portal-title">
        <a :href="link" target="_blank" :data-toggle="title" data-placement="bottom" :title="toolTip">
            <img id="logo" :src="logo">
            <span id="title-text" v-html="title"/>
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
            overflow: hidden;
            text-overflow: ellipsis;
            display: inline-block;
            vertical-align: middle;
        }
    }
}

</style>