
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
        click: {
            type: Function,
            default: () => {
                /* noop */
            }
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
    <div
        :tabindex="active ? 0 : -1"
        :class="['control-icon', 'glyphicon', glyphiconClass, active ? 'active' : 'inactive']"
        :title="title"
        @click="click"
    >
        <!-- children should usually be placed absolutely in relation to ControlIcon -->
        <slot />
    </div>
</template>

<style lang="less" scoped>
    @import "../../variables.less";

    .control-icon {
        display: block;
        text-align: center;
        top: auto;
        font-size: 22px;
        height: 36px;
        width: 36px;
        margin: 5px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
        &:hover {
            cursor: pointer;
            background-color: @background_color_1_hover;
        }
        &:focus {
            cursor: pointer;
            outline: 1px solid black;
            background-color: @background_color_1_focus;
        }
        &:active {
            cursor: pointer;
            background-color: @background_color_1_active;
        }
        &::before {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }

    .active {
        color: @color_1;
        pointer-events: all;
        background-color: @background_color_1;
    }

    .inactive {
        color: @color_1;
        pointer-events: none;
        background-color: @color_inactive;
    }
</style>
