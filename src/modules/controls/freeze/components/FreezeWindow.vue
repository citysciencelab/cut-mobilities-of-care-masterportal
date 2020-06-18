<script>

/**
 * Freeze control that allows the user to freeze the current window
 * of desktop and Mobile browser
 */
export default {
    name: "FreezeWindow",
    data: function () {
        return {
            isTable: Radio.request("Util", "getUiStyle") === "TABLE"
        };
    },
    methods: {
        /**
         * emitting the function in parent Freeze Component to hide the freezed window
         * @returns {void}
         */
        hideFreezeWin () {
            this.$emit("hideFreezeWin");
        }
    }
};
</script>

<template>
    <div
        id="freeze-view"
        class="freeze-view freeze-activated"
    >
        <p
            :class="isTable ? 'table freeze-view-close' : 'freeze-view-close'"
            :title="$t(`common:modules.controls.freeze.unfreeze`)"
            @click="hideFreezeWin"
        >
            {{ $t(`common:modules.controls.freeze.unfreeze`) }}
        </p>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    .freeze-view.freeze-activated {
        z-index: 10000;
        position: fixed;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
    }

    .freeze-view-close {
        z-index: 10001;
        cursor: pointer;
        position: absolute;
        border-radius: 12px;
        font-size: 26px;
        left: 30px;
        top: 30px;
        width: 600px;
        height: 60px;
        line-height: 60px;
        text-align: center;
        background-color: #646262;
        color: #ffffff;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.5);
        &.table {
            left: 0;
            right: 0;
            margin-left: auto;
            margin-right: auto;
        }
    }

    #table-navigation {
        &.table-nav-0deg, &.table-nav-0deg.ui-draggable {
            .freeze-view-close {
                transform: rotate(0deg);
                -webkit-transform-origin: 50% 50%;
                -ms-transform-origin: 50% 50%;
                -moz-transform-origin: 50% 50%;
            }
        }
        &.table-nav-90deg {
            .freeze-view-close {
                transform: rotate(90deg);
                -webkit-transform-origin: 5% 50%;
                -ms-transform-origin: 5% 50%;
                -moz-transform-origin: 5% 50%;
            }
        }
        &.table-nav-180deg {
            .freeze-view-close {
                transform: rotate(180deg);
                -webkit-transform-origin: 40% 50%;
                -ms-transform-origin: 40% 50%;
                -moz-transform-origin: 40% 50%;
            }
        }
        &.table-nav-270deg {
            .freeze-view-close {
                transform: rotate(270deg);
                -webkit-transform-origin: 42% 405%;
                -ms-transform-origin: 42% 405%;
                -moz-transform-origin: 42% 405%;
            }
        }
    }
</style>
