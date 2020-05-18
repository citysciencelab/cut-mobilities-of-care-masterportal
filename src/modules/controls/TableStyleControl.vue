<script>
/**
 * Component that renders an entry to the table style tool box.
 * In table style mode, some controls are put in the tool box.
 *
 * This component does render itself to the spot where toolbox
 * children are, #table-tools-menu.
 */
export default {
    name: "TableStyleControl",
    props: {
        /** Name of the glyphicon, with or without prefix "glyphicon-". */
        iconName: {
            type: String,
            required: true
        },
        /** Whether the control is currently clickable. */
        active: {
            type: Boolean,
            default: true
        },
        /** Hover text of the control. */
        title: {
            type: String,
            required: true
        },
        /** Click function. */
        onClick: {
            type: Function,
            default: () => {
                console.warn("No function was defined for this TableStyleControl.");
            }
        }
    },
    computed: {
        /** @returns {string} string with prefixed "glyphicon-" if it was missing */
        glyphiconClass () {
            return this.iconName.startsWith("glyphicon-") ? this.iconName : `glyphicon-${this.iconName}`;
        }
    },
    mounted () {
        // NOTE As soon as the toolbox itself is written in vue, this component should be used as a child of it instead of this current cross-rendering.
        $("#table-tools-menu").append(this.$el);
    }
};
</script>

<template>
    <button
        type="button"
        class="control-icon-table-style"
        tabindex="-1"
        :title="title"
        :disabled="!active"
        @click="onClick"
        @keyup.space.stop.prevent="onClick"
    >
        <a
            href="#"
            :tabindex="active ? '0' : '-1'"
        >
            <span :class="['glyphicon', glyphiconClass]" />
            <!-- use slot for button text -->
            <slot />
        </a>
    </button>
</template>

<style lang="less" scoped>
    @import "../../variables.less";

    .control-icon-table-style {
        display: flex;
        flex-direction: row;
        pointer-events: all;
        cursor: pointer;

        width: 100%;
        margin: 0 0 6px;
        padding: 6px 0 0;

        color: #808080;
        font-size: 17px;

        border-style: solid;
        border-color: #C0C0C0;
        border-width: 1px 0 0 0;

        > a {
            color: #808080;
        }

        /* position icon in center of button */
        &::before {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        /* pseudo-class state effects */
        /* NOTE these do not yet exist; when all table style controls are
                done with this component, they should be decided on for all
        &:hover {}
        &:focus {}
        &:active {}
        &:disabled {}
        */
    }
</style>
