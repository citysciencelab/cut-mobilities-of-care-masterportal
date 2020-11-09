<script>

/**
 * Freeze control that allows the user to freeze the current window
 * of desktop and Mobile browser
 */
export default {
    name: "FreezeWindow",
    data: function () {
        return {
            isTable: Radio.request("Util", "getUiStyle") === "TABLE",
            posValues: ""
        };
    },
    computed: {
        cssVars () {
            const rotationValue = document.getElementById("table-navigation").className.match(/\d+/g)[0];
            let xVal,
                yVal;

            if (rotationValue === "0") {
                xVal = 50;
                yVal = 50;
            }
            else if (rotationValue === "90") {
                xVal = 5;
                yVal = 30;
            }
            else if (rotationValue === "180") {
                xVal = 48;
                yVal = 50;
            }
            else if (rotationValue === "270") {
                xVal = 47;
                yVal = 477;
            }

            return {
                "--topValue": Math.round(document.getElementById("table-navigation").getBoundingClientRect().top) + "px",
                "--leftValue": Math.round(document.getElementById("table-navigation").getBoundingClientRect().left) + "px",
                "--rotationValue": rotationValue + "deg",
                "--xOrigin": xVal + "%",
                "--yOrigin": yVal + "%"
            };
        }
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
            :style="isTable ? cssVars : ''"
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
            left: var(--leftValue);
            top: var(--topValue);
            margin-left: auto;
            margin-right: auto;
            transform: rotate(var(--rotationValue));
            transform-origin: var(--xOrigin) var(--yOrigin);
            -webkit-transform-origin: var(--xOrigin) var(--yOrigin);
            -ms-transform-origin: var(--xOrigin) var(--yOrigin);
            -moz-transform-origin: var(--xOrigin) var(--yOrigin);
        }
    }

 #table-navigation {
        &.table-nav-0deg, &.table-nav-0deg.ui-draggable {
            .freeze-view-close {
                transform: rotate(0deg);
                transform-origin: 50% 50%;
                -webkit-transform-origin: 50% 50%;
                -ms-transform-origin: 50% 50%;
                -moz-transform-origin: 50% 50%;
            }
        }
        &.table-nav-90deg {
            .freeze-view-close {
                transform: rotate(90deg);
                transform-origin: 5% 50%;
                -webkit-transform-origin: 5% 50%;
                -ms-transform-origin: 5% 50%;
                -moz-transform-origin: 5% 50%;
            }
        }
        &.table-nav-180deg {
            .freeze-view-close {
                transform: rotate(180deg);
                transform-origin: 40% 50%;
                -webkit-transform-origin: 40% 50%;
                -ms-transform-origin: 40% 50%;
                -moz-transform-origin: 40% 50%;
            }
        }
        &.table-nav-270deg {
            .freeze-view-close {
                transform: rotate(270deg);
                transform-origin: 42% 405%;
                -webkit-transform-origin: 42% 405%;
                -ms-transform-origin: 42% 405%;
                -moz-transform-origin: 42% 405%;
            }
        }
    }
</style>
