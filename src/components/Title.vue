<template>
    <div class="portal-title">
        <a :href="link" target="_blank" :data-toggle="title" data-placement="bottom" :title="toolTip">
            <img :src="logo">
        </a>
        <span>
            {{ title }}
        </span>
    </div>
</template>

<script>
export default {
    created() {
        const that = this,
            myBus = Backbone.Events;

        myBus.listenTo(Radio.channel("Preparser"), {
            isParsed: function (response) {
                that.$store.state.configJson = response.portalConfig;
                that.$store.commit("setDefaultParameters", that.$store.state.configJson, that.$store.state);
            }
        });
    },
    mounted () {
        // document.getElementById("root").appendChild(this.$el);
        $(this.$el).insertAfter(document.getElementById("root"));
    },
    computed: {
        link () {
            return this.$store.state.Title.link;
        },
        toolTip () {
            return this.$store.state.Title.toolTip;
        },
        logo () {
            return this.$store.state.Title.logo;
        },
        title () {
            return this.$store.state.Title.title;
        }
    }
}

</script>

<style scoped>

.portal-title {
    padding-left: 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 26px;
    color: rgb(51,51,51);
    font-family: 'MasterPortalFont','Arial Narrow',Arial,sans-serif;
    vertical-align: middle;
    line-height: 50px;
    float: left;
    >a {
        >img {
            margin: 5px 5px 5px 5px;
            max-height: 40px;
        }
    }
    >span {
        padding-left: 5px;
    }
}

</style>