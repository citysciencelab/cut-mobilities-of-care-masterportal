<script>
import {mapGetters, mapActions} from "vuex";

export default {
    name: "Title",
    computed: {
        ...mapGetters("Title", [
            "link",
            "toolTip",
            "logo",
            "title"
        ])
    },
    mounted () {
        this.$nextTick(() => {
            this.initialize();
        });
        $(this.$el).insertAfter(document.getElementById("root"));
    },
    created () {

        const myBus = Backbone.Events;

        myBus.listenTo(Radio.channel("Title"), {
            "setSize": () => {
                setTimeout(() => {
                    this.renderDependingOnSpace();
                }, 500);
            }
        });
    },
    methods: {
        ...mapActions("Title", ["initialize"]),
        /**
        * Depending on the available space, the titletext and titlelogo is rendered.
        * @returns {Void}  -
        */
        renderDependingOnSpace: function () {
            let navMenuWidth,
                searchbarWidth,
                navBarWidth,
                titleWidth,
                titleTextWidth,
                rest,
                logo;
            const titleEl = document.getElementsByClassName("portal-title"),
                titlePadding = 10;

            this.$el.style.display = "block";
            document.getElementById("title-text").style.display = "inline-block";

            if (document.getElementById("searchbar")) {
                navMenuWidth = document.getElementById("root").offsetWidth;
                searchbarWidth = document.getElementById("searchbar").offsetWidth;
                navBarWidth = document.getElementById("main-nav").offsetWidth;
                titleTextWidth = document.getElementById("title-text").offsetWidth;
                logo = document.getElementById("logo").offsetWidth;
                titleWidth = titleEl ? titleEl[0].offsetWidth : 0;

                if (!this.$store.state.Title.titleWidth) {
                    if (titleWidth > titlePadding) {
                        this.$store.state.Title.titleWidth = titleWidth;
                    }
                }

                rest = navBarWidth - navMenuWidth - searchbarWidth;
                document.getElementById("title-text").style.width = (rest - logo - titlePadding).toString() + "px";

                if (logo < rest && this.$el.style.display === "none") {
                    this.$el.style.display = "block";
                }
                else if (rest < logo && this.$el.style.display === "block") {
                    this.$el.style.display = "none";
                }
                if (rest - titleTextWidth - logo - titlePadding < (30 / titleTextWidth * 100) - titleTextWidth && document.getElementById("title-text").style.display === "inline-block") {
                    document.getElementById("title-text").style.display = "none";
                }
                else if (rest - titleTextWidth - logo - titlePadding > (30 / titleTextWidth * 100) && document.getElementById("title-text").style.display === "none") {
                    document.getElementById("title-text").style.display = "inline-block";
                }
            }
        }
    }
};
</script>

<template>
    <div class="portal-title">
        <a
            :href="link"
            target="_blank"
            :data-toggle="title"
            data-placement="bottom"
            :title="toolTip"
        >

            <img
                id="logo"
                :src="logo"
            >
            <span
                id="title-text"
                v-html="title"
            />
        </a>
    </div>
</template>

<style lang="less" scoped>
@import "~variables";

.portal-title {
    margin-left: 10px;
    overflow: hidden;
    line-height: 50px;
    float: left;
    a {
        text-decoration: none;
        display: block;
        img {
            margin: 0 5px 0 5px;
            max-height: 40px;
            display: inline-block;
            vertical-align: middle;
        }
        span {
            color: @secondary_contrast;
            margin-left: 5px;
            font-size: 26px;
            font-family: @font_family_narrow;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: inline-block;
            vertical-align: middle;
        }
    }
}

</style>
