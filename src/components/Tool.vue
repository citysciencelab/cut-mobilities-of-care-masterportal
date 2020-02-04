<template>
    <div v-if="active" v-bind:class="[renderToWindow ? 'tool-window-vue ui-widget-content' : 'sidebar-vue']"
    >
        <div class="win-heading header">
            <p class="buttons pull-right">
                <span class="glyphicon glyphicon-remove" v-on:click="close($event)"></span>
            </p>
            <p class="buttons pull-left move">
                <span class="glyphicon win-icon" v-bind:class="icon"></span>
            </p>
            <p class="title move">
                <span>{{title}}</span>
            </p>
        </div>
        <div class="win-body">
            <slot name="toolBody"></slot>
        </div>
    </div>
</template>
<script>
import { mapState } from "vuex";

export default {
    name: "Tool",
    props: ["title", "icon", "active", "renderToWindow"],
    mounted() {
        document.getElementsByTagName("body")[0].appendChild(this.$el);
    },
    watch: {
        active(newValue, oldValue) {
            if (newValue) {
                if (!this.renderToWindow) {
                    document.getElementById("map").style.width = "70%";
                    Radio.trigger("Map", "updateSize");
                } else {
                    document.getElementById("map").style.width = "100%";
                }
            }
            else {
                const sidebars = document.getElementsByClassName("sidebar");
                if(! sidebars || sidebars.length === 0){
                    //only set the map to full width, if not another sidebar is open
                    // das muss spaeter anders geloest werden, wenn alle tools im store registriert sind kann abgefragt werden, ob die sidebar sichtbar ist
                    document.getElementById("map").style.width = "100%";
                    Radio.trigger("Map", "updateSize");
                }
            }
        }
    },
    methods: {
        close(event) {
            if (!this.renderToWindow) {
                document.getElementById("map").style.width = "100%";
                Radio.trigger("Map", "updateSize");
            }
            // emit event to parent e.g. SupplyCoord (which uses the tool as component and is therefor the parent)
            this.$parent.$emit("close", event);
        }
    }
};
</script>
<style lang="less">
@color_1: rgb(85, 85, 85);
@color_2: rgb(255, 255, 255);
@font_family_1: "MasterPortalFont Bold", "Arial Narrow", Arial, sans-serif;
@font_family_2: "MasterPortalFont", sans-serif;
@background_color_1: rgb(255, 255, 255);
@background_color_2: #e10019;
@background_color_3: #f2f2f2;
@background_color_4: #646262;

.header() {
    > .header {
        padding-left: 10px;
        border-bottom: 1px solid rgb(229, 229, 229);
        font-family: @font_family_1;
        > .move {
            cursor: move;
        }
        > .title {
            white-space: nowrap;
            min-width: 250px;
            font-size: 14px;
            padding-top: 8px;
            padding-bottom: 5px;
            color: @color_1;
            width: calc(100% - 50px);
            margin: 0;
            height: 34px;
        }
        > .buttons {
            color: @color_1;
            font-size: 14px;
            margin: 0;
            > .glyphicon-minus {
                top: 3px;
            }
            > span {
                padding: 8px 8px 8px 0px;
                &:hover {
                    &:not(.win-icon) {
                        opacity: 0.7;
                        cursor: pointer;
                    }
                }
            }
        }
    }
}

@media (max-width: 766px) {
    .tool-window {
        right: 0;
    }
}

.tool-window-vue {
    background-color: @background_color_1;
    margin: 10px 10px 30px 10px;
    display: block;
    position: absolute !important;
    top: 60px;
    left: 0;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
    z-index: 999;
    max-width: 500px;
    .header();
    > .header-min {
        background-color: @background_color_2;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
        > .move {
            cursor: pointer;
        }
        > .title {
            color: @color_2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 120px;
            min-width: 0;
        }
        > .buttons {
            color: @color_2;
        }
    }
}
.win-body {
    padding: 20px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    background-color: @background_color_1;
    max-height: 72vh;
}
.table-tool-win-all {
    font-family: @font_family_2;
    border-radius: 12px;
    background-color: @background_color_4;
    margin-bottom: 30px;
    .header {
        font-family: @font_family_2;
        > .title {
            color: @color_2;
        }
        > .buttons {
            color: @color_2;
        }
    }
    .win-body {
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
        background-color: @background_color_3;
        * {
            border-radius: 12px;
        }
    }
}
.table-tool-window {
    transform: rotate(0deg);
}
.table-tool-window-90deg {
    left: 20px;
    transform: rotate(90deg);
}
.table-tool-window-180deg {
    top: 20px;
    left: 20px;
    margin-bottom: 30px;
    transform: rotate(180deg);
}
.table-tool-window-270deg {
    top: 40px;
    margin-bottom: 30px;
    transform: rotate(270deg);
}
.sidebar-vue {
    height: calc(100% - 50px);
    float: left;
    overflow: auto;
    display: block;
    position: absolute;
    top: 50px;
    right: 0;
    width: 30%;
    .header();
}
</style>