<script>
export default {
    name: "Tool",
    props: {
        title: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            required: true
        },
        renderToWindow: {
            type: Boolean,
            required: true
        },
        resizableWindow: Boolean,
        initialWidth: {
            type: Number,
            default: 0.3
        },
        deactivateGFI: {
            type: Boolean,
            required: true
        }
    },
    data () {
        return {
            draggable: false,
            maxPosTop: 0,
            maxPosLeft: 0,
            width: this.initialWidth,
            isDragging: false
        };
    },
    computed: {
        clientWidth () {
            return this.width * window.innerWidth + "px";
        }
    },
    watch: {
        active (newValue) {
            const modelCollection = Radio.request("ModelList", "getCollection"),
                gfiModel = modelCollection ? modelCollection.findWhere({id: "gfi"}) : undefined;

            if (newValue === false) {
                this.draggable = false;
                $(".backdrop").remove();
            }
            else if (!this.renderToWindow && Radio.request("Util", "isViewMobile")) {
                $("#masterportal-container").append("<div class='backdrop'></div>");
            }
            if (newValue && gfiModel) {
                gfiModel.setIsActive(!this.deactivateGFI);
            }
            else {
                Radio.trigger("ModelList", "toggleDefaultTool");
            }

            this.updateMap();
        }
    },
    updated () {
        if (this.renderToWindow && this.draggable === false && this.active) {
            // tried to do this in mounted.nextTick, but the el is not filled then
            $(this.$el).draggable({
                containment: "#map",
                handle: ".move",
                start: function (event, ui) {
                    // As .draggable works by manipulating the css top and left values the following code is necessary if the bottom and right values
                    // are used for the positioning of the tool window (as is the case for the table tool window). Otherwise dragging the window will
                    // resize the window if no height and width values are set.
                    ui.helper.css({
                        right: "auto",
                        bottom: "auto"
                    });
                },
                stop: function (event, ui) {
                    ui.helper.css({"height": "", "width": ""});
                }
            });
            this.draggable = true;
        }
        if (!this.renderToWindow) {
            this.addEventListeners();
        }
        else {
            this.removeEventListeners();
        }
    },
    methods: {
        /**
         * Updates the size of the map depending on sidebars visibility
         *  @return {void}
         */
        updateMap () {
            if (!this.renderToWindow && this.active) {
                // only set the map to full width, if not another sidebar is open
                document.getElementById("map").style.width = (1 - this.width) * 100 + "%";
            }
            else {
                document.getElementById("map").style.width = "100%";
            }
            Radio.trigger("Map", "updateSize");
        },
        /**
         * Minimizes the Window
         *  @return {void}
         */
        minimize: function () {
            const el = $(this.$el);

            this.maxPosTop = el.css("top");
            this.maxPosLeft = el.css("left");
            $(".win-body-vue").hide();
            el.find(".glyphicon-minus").hide();
            el.css({"top": "auto", "bottom": "0", "left": "0", "margin-bottom": "60px"});
            $(".header").addClass("header-min");
            el.draggable("disable");
        },
        /**
         * Maximizes the Window
         *  @return {void}
         */
        maximize: function () {
            if ($(".win-body-vue").css("display") === "none") {
                const el = $(this.$el);

                $(".win-body-vue").show();
                $(".glyphicon-minus").show();
                el.css({"top": this.maxPosTop, "bottom": "", "left": this.maxPosLeft, "margin-bottom": "30px"});
                $(".header").removeClass("header-min");
                el.draggable("enable");
            }
        },
        /**
         * Updates size of map and emits event to parent.
         * @param {Event} event the click event
         * @return {void}
         */
        close (event) {
            this.updateMap();
            // emit event to parent e.g. SupplyCoord (which uses the tool as component and is therefor the parent)
            this.$parent.$emit("close", event);
        },
        /**
         * adds the eventListeners to the window Object
         * responsible for handling the drag Events on Keyboard and Touch
         * @returns {void}
         */
        addEventListeners () {
            window.addEventListener("mouseup", () => {
                this.dragEnd();
            });
            window.addEventListener("mousemove", (event) => {
                this.dragMove(event);
            });
            window.addEventListener("touchend", () => {
                this.dragEnd();
            });
            window.addEventListener("touchmove", (event) => {
                this.dragMove(event);
            });
        },
        /**
         * adds the eventListeners to the window Object
         * responsible for handling the drag Events on Keyboard and Touch
         * @returns {void}
         */
        removeEventListeners () {
            window.removeEventListener("mouseup", () => {
                this.dragEnd();
            });
            window.removeEventListener("mousemove", (event) => {
                this.dragMove(event);
            });
            window.removeEventListener("touchend", () => {
                this.dragEnd();
            });
            window.removeEventListener("touchmove", (event) => {
                this.dragMove(event);
            });
        },
        /**
         * handles the drag Start event to resize the sidebar
         * @param {*} event the DOM-event
         * @returns {void}
         */
        dragStart: function (event) {
            event.preventDefault();
            this.isDragging = true;
        },
        /**
         * handles the drag move event to resize the sidebar
         * @param {Event} event the DOM-event
         * @returns {void}
         */
        dragMove: function (event) {
            if (this.isDragging) {
                const eventX = event.type === "touchmove" ? event.touches[0].clientX : event.clientX;

                this.width = (window.innerWidth - eventX) / window.innerWidth;
                this.updateMap();
            }
        },
        /**
         * handles the drag End event to resize the sidebar
         * @returns {void}
         */
        dragEnd () {
            this.isDragging = false;
        }

    }
};
</script>

<template>
    <div
        v-if="active"
        :class="[renderToWindow ? 'tool-window-vue ui-widget-content' : 'sidebar-vue']"
        :style="[renderToWindow ? '' : {width: clientWidth}]"
    >
        <div
            v-if="resizableWindow"
            :class="['drag-bar', {dragging: isDragging}]"
            @mousedown="dragStart"
            @touchstart="dragStart"
        >
            &#8942;
        </div>
        <div class="win-heading header">
            <p class="buttons pull-right">
                <span
                    v-if="renderToWindow"
                    class="glyphicon glyphicon-minus"
                    title="Minimieren"
                    @click="minimize"
                />
                <span
                    class="glyphicon glyphicon-remove"
                    @click="close($event)"
                />
            </p>
            <p :class="['buttons', 'pull-left', {move: renderToWindow}]">
                <span
                    class="glyphicon win-icon"
                    :class="icon"
                />
            </p>
            <p
                :class="['title', {move: renderToWindow}]"
                @click="maximize"
            >
                <span>{{ title }}</span>
            </p>
        </div>
        <div class="win-body-vue">
            <slot name="toolBody" />
        </div>
    </div>
</template>

<style lang="less" scoped>
@import "~variables";
@color_1: rgb(85, 85, 85);
@color_2: rgb(255, 255, 255);
@font_family_2: "MasterPortalFont", sans-serif;
@background_color_1: rgb(255, 255, 255);
@background_color_2: #e10019;
@background_color_3: #f2f2f2;
@background_color_4: #646262;

.header() {
    > .header {
        padding-left: 10px;
        border-bottom: 1px solid rgb(229, 229, 229);
        font-family: @font_family_narrow;
        background: white;
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

    .drag-bar {
        display:none;
    }

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
.win-body-vue {
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
    .win-body-vue {
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
    float: left;
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    background-color: @background_color_1;
    .header();
    .win-body-vue {
        max-height: calc(100vh - 50px);
    }

    .drag-bar {
        position:absolute;
        display: inline-block;
        height: calc(100vh - 50px);
        line-height: calc(100vh - 50px);
        vertical-align: top;
        width:20px;
        text-align: center;
        font-size: 24px;
        border-right: 1px solid #fafafa;
        cursor: grab;
        &:hover {
            background: rgb(250, 250, 250);
        }
        &.dragging {
            cursor:grabbing;
        }
    }
}

@media (max-width: 767px) {
    .tool-window {
        right: 0;
    }
    .sidebar-vue {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 1050;
        overflow-x: hidden;
        overflow-y: auto;
        margin: 3%;
    }
}
</style>
