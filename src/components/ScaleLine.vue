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
        }

    },
    created () {
        const that = this,
            myBus = Backbone.Events;

        myBus.listenTo(Radio.channel("MapView"), {
            changedOptions: function (options) {
                that.$store.dispatch("modifyScale", options);
                that.$store.dispatch("updateScaleLineValue", options);
            }
        });
        myBus.listenTo(Radio.channel("Map"), {
            change: function (mode) {
                that.$store.state.ScaleLine.mapMode = mode;
            }
        });
        myBus.listenTo(Radio.channel("Footer"), {
            isReady: function () {
                document.getElementsByClassName("footer")[0].appendChild(that.$el);
            }
        });
    }
}
</script>

<template>
    <div v-if="mapMode != 'Oblique'" class="scale-line">
        <span class="scale">
        {{scaleLineValue}}
        </span>
        <span class="scale">
            1: {{scaleNumber}}
        </span>
    </div>
</template>

<style lang="less">
.scale-line {
    background: none repeat scroll 0 0 rgba(255, 255, 255, 0.8);
    border-radius: 0 5px 0 0;
    bottom: 0;
    color: #777;
    position: absolute;
    text-align: center;
    font-size: 10px;
    padding: 4px 8px;
    right: 0px;
}
.scale {
    &:first-child {
        border-bottom: 1px solid;
        border-left: 1px solid;
        border-right: 1px solid;
        padding: 0 20px;
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
