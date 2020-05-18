<script>
/* TODO
 * Idea: control loader visibility via store module
 * Concept:
 *  - Store Module holds an array of keys (= strings)
 *  - Any component/loading procedure/... has a key (its name)
 *  - Anything may add its own key to the array of keys
 *  - When done, they must remove their own key
 * => As long as anything has its key registered, the loader is shown
 */
export default {
    name: "Loader",
    data () {
        return {
            imgUrl: "/img/ajax-loader.gif"
        };
    },
    computed: {
        simple () {
            // TODO not yet controlled - should be in config.JSON or config.JS maybe?
            return false;
        }
    }
};
</script>

<template>
    <div
        id="loader"
        :class="simple ? 'simple' : ''"
    >
        <img
            v-if="simple"
            class="simple-loader"
            :src="imgUrl"
        >
        <div
            v-else
            class="complex-loader"
        >
            <img
                class="portal-logo"
                src="https://geoportal-hamburg.de/lgv-config/img/Logo_Masterportal.svg"
                alt="Masterportal"
            >
            <div class="loader-text">
                Masterportal
            </div>
            <img
                class="loader-icon"
                :src="imgUrl"
            >
        </div>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    #loader {
        position: absolute;
        height: 100%;
        width: 100%;

        background-color: @secondary;
        color: @secondary_contrast;

        &.simple {
            background-color: @shadow_overlay;
        }

        .simple-loader {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .complex-loader {
            position: absolute;

            display: flex;
            flex-direction: column;

            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            text-align: center;

            .portal-logo {
                width: 35vw;
            }

            .loader-text {
                font-family: @font_family_accent;
                font-size: 5vmin;
                line-height: 130%;
                margin: 5% 0;
            }

            .loader-icon {
                align-self: center;
            }
        }
    }
</style>
