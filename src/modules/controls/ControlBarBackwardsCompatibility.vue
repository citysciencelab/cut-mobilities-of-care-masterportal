<script>
/**
 * NOTE This is a temporary implementation. As soon as "old-style" controls
 * are no longer supported, this component and all uses of it can be removed.
 */
export default {
    name: "ControlBarBackwardsCompatibility",
    props: {
        /** id to use - jQuery adds old controls by this */
        id: {
            type: String,
            required: true
        }
    }
};
</script>

<template>
    <div
        :id="id"
        class="backwards-compatibility-controls"
    />
</template>

<style lang="less">
    @color_1: #f3f3f3;
    @background_color_1: #E10019;
    @background_color_2: rgb(8,88,158);

    /* using this classname to scope css effects; can not use scoped less here since controls are not within scope, but added by jQuery */
    .backwards-compatibility-controls {
        /* use old styling way for glyphicons for old controls */
        .glyphicon {
            color: @color_1;
            background-color: @background_color_1;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
            &:hover {
                cursor: pointer;
                opacity: 0.7;
            }
        }
        > .toggleButtonPressed {
            background-color: @background_color_2;
        }
        /* forcing compatibility by overriding old-style layouting */
        .controls-row-right {
            position: relative;
            margin-right: 0px;
            min-height: 0px;
        }
        .row {
            margin-right: 0px;
            margin-left: 0px;
        }
        > div {
            padding: 5px;
            > div {
                margin-top: 0px;
            }
        }
    }
</style>
