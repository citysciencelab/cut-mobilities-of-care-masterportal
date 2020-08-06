<script>
import Default from "../themes/Default.vue";
import Schulinfo from "../themes/Schulinfo.vue";
import Modal from "../../../../../share-components/modals/Modal.vue";

export default {
    name: "Mobile",
    components: {
        Default,
        Schulinfo,
        Modal
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
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
            console.info(4555);
        }
    }
};
</script>

<template>
    <Modal
        :show-modal="true"
    >
        <!-- header slot -->
        <component
            :is="currentTheme"
            @:my-event="minimize"
        />
        <!-- footer slot -->
        <div class="modal-footer gfi-footer">
            <div class="pager-left <% if(themeIndex === 0) {print (' disabled') }%>">
                <span class="glyphicon glyphicon-chevron-left"></span>
            </div>
            <div class="pager-right <% if(themeIndex === numberOfThemes - 1) {print (' disabled') }%>">
                <span class="glyphicon glyphicon-chevron-right"></span>
            </div>
        </div>
    </Modal>
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
