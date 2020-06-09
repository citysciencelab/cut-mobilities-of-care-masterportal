<script>

/**
 * Freeze control that allows the user to freeze the current window
 * of desktop and Mobile browser
 */
export default {
    name: "FreezeWindow",
    data: function () {
        return {
            active: false,
            isTable: Radio.request("Util", "getUiStyle") === "TABLE"
        };
    },
    methods: {
        /**
         * changing to inactive to hide the freezed window
         * @returns {void}
         */
        hideFreezeWin () {
            this.active = false;
            const freeView = document.getElementById("freeze-view");

            freeView.className = "freeze-view freeze-deactivated";
        },

        /**
         * setting the position of the freezebox according to the device type
         * @returns {Object} style with left and top
         */
        positionStyle () {
            let left = "30px",
                top = "30px",
                style = {};

            if (this.isTable) {
                left = document.getElementsByClassName("table-nav-main")[0].offsetLeft;
                top = document.getElementsByClassName("table-nav-main")[0].offsetTop;
            }

            style = {
                left: left,
                top: top
            };

            return style;
        }
    }
};
</script>

<template>
    <div
        id="freeze-view"
        :class="active ? 'freeze-view freeze-activated' : 'freeze-view freeze-deactivated'"
    >
        <p
            class="freeze-view-close"
            :style="positionStyle()"
            :title="$t(`common:modules.controls.freeze.unfreeze`)"
            @click="hideFreezeWin"
        >
            {{ $t(`common:modules.controls.freeze.unfreeze`) }}
        </p>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    @color: white;
    @background_color: #646262;

    .freeze-view {
        z-index: 10000;
        position: absolute;
        top: -100000px;
        left: -100000px;
        width: 100%;
        height: 100%;
    }
    .freeze-activated {
        position: absolute;
        top: 0px;
        left: 0px;
    }
    .freeze-deactivated {
        height: 10px;
        width: 10px;
        .freeze-view-close {
            left: 0px;
            top: 0px;
        }
    }
    .freeze-view-close {
        z-index: 10001;
        cursor: pointer;
        position: absolute;
        border-radius: 12px;
        font-size: 26px;
        width: 600px;
        height: 60px;
        line-height: 60px;
        text-align: center;
        background-color: @background_color;
        color: @color;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.5);
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
