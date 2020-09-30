<script>

import {mapGetters, mapMutations} from "vuex";
import getters from "../../store/gettersGfi";

export default {
    name: "DataTable",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    methods: {
        ...mapMutations("Tools/Gfi", ["setUsePager"]),
        ...mapGetters("Tools/Gfi", Object.keys(getters))
    },
    
    mounted () {
        this.setUsePager(false);
        console.log(this.refinedData);
        


        this.gfiFeatures.forEach(singleFeature => {
            //console.log(singleFeature.getAttributesToShow());
            
        });
    },
    
    computed: {
        ...mapGetters("Map", {
            gfiFeatures: "gfiFeatures"
        }),
        
        refinedData: function () {
            const result = {
                mapping: {},
                head: [],
                rows: [],
            };
            
            this.gfiFeatures.forEach(singleFeature => {
                const attrsToShow = singleFeature.getAttributesToShow(),
                    valsToShow = singleFeature.getProperties();
                
                Object.keys(attrsToShow).forEach(attrKey => {
                    if (valsToShow[attrKey] !== undefined && typeof valsToShow[attrKey] === "string" && result.head.indexOf(attrKey) === -1) {
                        result.head.push(attrKey);
                        result.mapping[attrKey] = attrsToShow[attrKey];
                    }
                });

                result.rows.push(valsToShow);
            });
            
            return result;
        },
        
        console: () => console
    },
    
    watch: {
        feature (newFeature) {
            //console.log(this.feature);
            //console.log(newFeature);
        }
    }
};
</script>

<template>
    <div id="table-data-container">
        <table 
            v-if="refinedData.rows.length > 0"
            class="table table-hover"
        >
            <thead>
                <th
                    v-for="propNameKey in refinedData.head"
                    :key="propNameKey"
                >
                    {{ refinedData.mapping[propNameKey] }}
                </th>
            </thead>
        
            <tbody>
                <tr
                    v-for="singleRow in refinedData.rows"
                >
                    <td
                        :load="console.log(singleRow)"
                        v-for="propKey in refinedData.head"
                    >
                        {{ singleRow[propKey] ? singleRow[propKey] : '' }}
                    </td>
                </tr>            
            </tbody>
        </table>
    </div>
</template>


<style lang="less" scoped>
@import "~variables";

#table-data-container {
    margin:6px 15px 0 12px;
    
    table {
        margin: 0;
        
        td, th {
            padding: 6px;
        }
    }
}


</style>
