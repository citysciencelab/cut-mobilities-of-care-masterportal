<script>

export default {
    name: "Trinkwasser",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            /**
             * this is the blueprint for the data to show in the gfi
             * the keys are the titles, the keys of the subobjects are the "subkeys"
             * the values have no meaning, keep them at null
             */
            blueprint: {
                "Untersuchungsergebnisse": {
                    "Entnahmedatum": null,
                    "Bezirk": null,
                    "Stadtteil": null,
                    "Versorgungsgebiet": null
                },
                "Mikrobiologische Parameter": {
                    "Coliforme Bakterien": null,
                    "Coliforme Bakterien Grenzwertwarnung": null,
                    "Coliforme Bakterien MPN": null,
                    "Coliforme Bakterien MPN Grenzwertwarnung": null,
                    "Escherichia coli": null,
                    "Escherichia coli Grenzwertwarnung": null,
                    "Escherichia coli (E.coli) MPN": null,
                    "Escherichia coli (E.coli) MPN Grenzwertwarnung": null,
                    "Koloniezahl, 20°C": null,
                    "Koloniezahl, 20°C Grenzwertwarnung": null,
                    "Koloniezahl, 36°C": null,
                    "Koloniezahl, 36°C Grenzwertwarnung": null,
                    "intestinale Enterokokken": null,
                    "intestinale Enterokokken Grenzwertwarnung": null
                },
                "Chemische Parameter": {}
            },
            /**
             * key (title) of the blueprint to place all not associated values in
             */
            addSecludedValuesInto: "Chemische Parameter"
        };
    },
    methods: {
        /**
         * adds the data of gfiContent into a blueprint based on the Trinkwasser-Theme logic
         * @param {Object} blueprint the blueprint to place the data in (blueprint will left untouched)
         * @param {Object} gfiContent an object of data (e.g. feature.getMappedProperties())
         * @param {String} addSecludedValuesInto the title (key) of the blueprint that will be filled with keys not associated with any title of the blueprint
         * @returns {Void}  a blueprint clone with filled values - the order of subkeys may differ based on gfiContent, the order of titles are based on blueprint
         */
        mapPropertiesToBlueprint (blueprint, gfiContent, addSecludedValuesInto) {
            const assoc = {},
                result = {};

            Object.keys(blueprint).forEach(title => {
                // adapt the title to keep the given order (of titles)
                result[title] = {};

                // create an association to quickly access title by subkey
                Object.keys(blueprint[title]).forEach(subkey => {
                    assoc[subkey] = title;

                    // adapt the subkey to keep the given order (of subkeys)
                    // not used at the moment - the subkeys shall be in the order of the given gfiContent
                    // result[title][subkey] = {};
                });
            });

            Object.keys(gfiContent).forEach(subkey => {
                if (assoc.hasOwnProperty(subkey)) {
                    result[assoc[subkey]][subkey] = gfiContent[subkey];
                }
                else {
                    // not associated value
                    result[addSecludedValuesInto][subkey] = gfiContent[subkey];
                }
            });

            return result;
        }
    }
};
</script>

<template>
    <table class="table table-condensed table-hover outerTable">
        <tbody>
            <tr
                v-for="(subkeys, title) in mapPropertiesToBlueprint(blueprint, feature.getMappedProperties(), addSecludedValuesInto)"
                :key="title"
            >
                <td class="outerTable">
                    <table class="table table-condensed table-hover innerTable">
                        <thead>
                            <tr>
                                <th colspan="2">
                                    {{ title }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(value, subkey) in subkeys"
                                :key="subkey"
                            >
                                <td class="firstCol">
                                    {{ subkey }}
                                </td>
                                <td class="secCol">
                                    {{ value ? value : "" }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style lang="less" scoped>
    @import "~variables";

    th {
        font-family: @font_family_accent;
        background-color: #f2f2f2;
    }

    td.outerTable {
        padding: 0px;
    }
    table.innerTable {
        width: 100%;
        margin-bottom: 0px;
    }
    table.innerTable td {
        padding: 8px;
    }
    td.firstCol {
        width: 60%;
        font-weight: bold;
    }
    td.secCol {
        width: 40%;
        text-align: left;
    }
</style>
