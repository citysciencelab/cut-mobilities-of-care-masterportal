<script>
import Default from "../themes/Default.vue";
import Schulinfo from "../themes/Schulinfo.vue";

export default {
    name: "Detached",
    components: {
        Default,
        Schulinfo
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            pagerIndex: 0
        };
    },
    computed: {
        currentTheme: function () {
            return this.upperFirst(this.feature.theme);
        }
    },
    methods: {
        upperFirst (string) {
            return string ? string.charAt(0).toUpperCase() + string.slice(1) : "";
        },
        minimize: function () {
            console.info(this);
            this.$emit("myevent2", "test");
            console.info(this.$parent);
            // this.$parent.test();
        }
    }
};
</script>

<template>
    <div>
        <!-- header -->
        <h1 @click="minimize">
            Desktop
        </h1>
        <!-- theme -->
        <component
            :is="currentTheme"
        />
        <!-- footer -->
        <div class="modal-footer gfi-footer">
            <div
                class="pager-left"
                @click="minimize"
            >
                <span class="glyphicon glyphicon-chevron-left"></span>
            </div>
            <div class="pager-right">
                <span class="glyphicon glyphicon-chevron-right"></span>
            </div>
        </div>
    </div>
</template>


<style lang="less">
@color_1: rgb(85, 85, 85);
@color_2: rgb(119, 119, 119);
@background_color_1: white;
@background_color_2: rgb(255, 255, 255);

.gfi-mobile {
    color: @color_1;
    font-size: 14px;
    .modal-header {
        padding: 0;
        border-bottom: 0;
    }
    .modal-title {
        padding: 8px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .glyphicon-remove {
        font-size: 16px;
        float: right;
        padding: 12px;
    }
    .modal-body {
        padding: 0;
        overflow-y: auto;
    }
    .gfi-image-zoom-button {
        top: -17px;
        background-color: @background_color_1;
        padding: 2px;
    }
    .gfi-image-copyright {
        top: -19px;
        position: relative;
        font-size: 0.9em;
        padding: 2px;
        background-color: @background_color_1;
    }
    table {
        margin: 0;
    }
}
.gfi-footer {
    padding: 0;
    color: @color_2;
    text-align: center;
    font-size: 22px;
    >div {
        background: #f3f3f3;
        padding: 6px;
        cursor: pointer;
        width: 50%;
    }
    >.disabled {
        cursor: not-allowed;
        background-color: @background_color_2;
        opacity: 0.2;
    }
    >.pager-left {
        float: left;
        border-right: 1px solid #ddd;
    }
    >.pager-right {
        float: right;
    }
}

</style>
