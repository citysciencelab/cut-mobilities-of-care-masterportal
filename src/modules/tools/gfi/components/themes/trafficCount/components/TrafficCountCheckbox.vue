<script>
export default {
    name: "TrafficCountCheckbox",
    props: {
        tableDiagramId: {
            type: String,
            required: true
        }
    },
    data () {
        return {
            isChecked: true
        };
    },
    computed: {
        diagramLabel: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.diagramLabel");
        },

        tableLabel: function () {
            return this.$t("common:modules.tools.gfi.themes.trafficCount.tableLabel");
        },

        checkboxLabel: function () {
            if (this.tableDiagramId.includes("table")) {
                return this.tableLabel;
            }

            return this.diagramLabel;
        },

        checkboxId: function () {
            return "checkbox-" + this.tableDiagramId;
        }
    },
    mounted: function () {
        // Setting the table hidden as default
        if (this.tableDiagramId.includes("table")) {
            this.isChecked = false;
            if (document.getElementById(this.tableDiagramId)) {
                document.getElementById(this.tableDiagramId).style.display = "none";
            }
        }
    },
    methods: {
        /**
         * toggle the table or diagram by clicking the checkbox
         * @param {Object[]} evt the target of current click event
         * @returns {Void}  -
         */
        toggleTableDiagram: function (evt) {
            if (evt && evt.target) {
                const checked = evt.target.checked,
                    toggledElementId = evt.target.value;

                if (!checked) {
                    document.getElementById(toggledElementId).style.display = "none";
                }
                else {
                    document.getElementById(toggledElementId).style.display = "block";
                }
            }
        }
    }
};
</script>

<template>
    <div class="tab-pane form-check">
        <input
            :id="checkboxId"
            v-model="isChecked"
            :value="tableDiagramId"
            type="checkbox"
            class="form-check-input"
            @click="toggleTableDiagram"
        >
        <label
            class="form-check-label"
            :for="checkboxId"
        >{{ checkboxLabel }}</label>
    </div>
</template>

<style lang="less" scoped>
    .form-check {
        width: 580px;
    }
    input.form-check-input {
        margin-left: 8px;
    }
</style>
