
<script>
export default {
    name: "ControlIcon",
    props: {
        iconName: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            default: true
        },
        title: {
            type: String,
            required: true
        },
        onClick: {
            type: Function,
            default: () => {
                /* noop */
            }
        },
        inline: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        glyphiconClass () {
            return this.iconName.startsWith("glyphicon-") ? this.iconName : `glyphicon-${this.iconName}`;
        }
    }
};
</script>

<template>
    <button
        type="button"
        :tabindex="active ? '0' : '-1'"
        :class="['control-icon', 'glyphicon', glyphiconClass, inline ? 'inline' : 'standalone']"
        :title="title"
        :disabled="!active"
        @click="onClick"
        @keyup.space.stop.prevent="onClick"
    >
        <!-- children should usually be placed absolutely in relation to ControlIcon -->
        <slot />
    </button>
</template>

<style lang="less" scoped>
    @import "../../variables.less";

    .standalone {
        display: block;
        text-align: center;
        top: auto;
        font-size: 22px;
        height: 36px;
        width: 36px;
        margin: 5px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
    }

    .inline {
        display: inline-block;
        text-align: center;
        width: @small_icon_width;
        height: @small_icon_width;
        font-size: 16px;
    }

    .control-icon {
        background-color: @background_color_1;
        color: @color_1;
        pointer-events: all;
        cursor: pointer;
        border: 0;

        /* position icon in center of button */
        &::before {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        /* pseudo-class state effects */
        &:hover {
            background-color: @background_color_1_hover;
        }
        &:focus {
            background-color: @background_color_1_focus;
            outline: 1px solid black;
        }
        &:active {
            background-color: @background_color_1_active;
        }

        &:disabled {
            background-color: @color_inactive;
            color: @color_1;
            cursor: default;
        }
    }
</style>
