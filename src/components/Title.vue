<script>

export default {
    created() {
        
    },
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

            return ((deprecatedParameter === undefined) ? this.$store.state.Title.logo : deprecatedParameter);
        },
        /**
        * PortalTitle
        * @deprecated in 3.0.0
        */
        title () {
            const deprecatedParameter = this.getDeprecatedParameters('PortalTitle');

            return ((deprecatedParameter === undefined) ? this.$store.state.Title.title : deprecatedParameter);
        },
    }
}
</script>

<template>
    <div class="portal-title">
        <a :href="link" target="_blank" :data-toggle="title" data-placement="bottom" :title="toolTip">
            <img :src="logo">
            <span>
                {{ title }}
            </span>
        </a>
    </div>
</template>

<style lang="less" scoped>

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
            color: #333333;
            margin-left: 5px;
            font-size: 26px;
            font-family: 'MasterPortalFont','Arial Narrow',Arial,sans-serif;
            white-space: nowrap;
            text-overflow: ellipsis;
            display: inline-block;
            vertical-align: middle;
        }
    }
}

</style>