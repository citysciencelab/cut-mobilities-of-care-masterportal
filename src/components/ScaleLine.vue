<script>
export default {
    name: "ScaleLine",
    computed: {
        scaleLineValue () {
            return this.$store.state.ScaleLine.scaleLineValue;
        },
        scaleNumber () {
            return this.$store.state.ScaleLine.scaleNumber;
        },
        mapMode () {
            return this.$store.state.ScaleLine.mapMode;
        },
        insideFooter () {
            return this.$store.state.ScaleLine.insideFooter;
        }

    },
    created () {
        const that = this,
            myBus = Backbone.Events;

        if (that.$store.state.ScaleLine.scaleLine) {
            myBus.listenTo(Radio.channel("MapView"), {
                changedOptions: function (options) {
                    that.$store.dispatch("modifyScale", options);
                    that.$store.dispatch("updateScaleLineValue", options);
                    document.getElementsByClassName("ol-viewport")[0].appendChild(that.$el);
                }
            });
            myBus.listenTo(Radio.channel("Map"), {
                change: function (mode) {
                    that.$store.state.ScaleLine.mapMode = mode;
                }
            });
        }
    }
};
</script>

<template>
    <div
        v-if="mapMode !== 'Oblique'"
        id="scale-line"
    >
        <span>
            {{ scaleLineValue }}
        </span>
        <span>
            1: {{ scaleNumber }}
        </span>
    </div>
</template>

<style lang="less">
div#scale-line {
    background: none repeat scroll 0 0 rgba(255, 255, 255, 0.8);
    border-radius: 0 5px 0 0;
    bottom: 0;
    color: #777;
    position: absolute;
    text-align: center;
    font-size: 10px;
    padding: 4px 40px;
    right: 0px;
    z-index: 1;
}
div#scale-line > span {
    &:first-child {
        border-bottom: 1px solid;
        border-left: 1px solid;
        border-right: 1px solid;
        display: inline-block;
        width: 2cm;
    }
    &:last-child {
        padding: 0 16px;
    }
}
@media (max-width: 767px) {
    .scale-line {
        display: none;
    }
}
@media (min-width: 768px) {
    .scale-line {
        display: block;
    }
}
</style>
