<script>
export default {
    name: "Solaratlas",
    props: {
        feature: {
            type: Object,
            required: true
        }
    }
};
</script>

<template>
    <div>
        <h6><strong>{{ $t("modules.tools.gfi.themes.solaratlas.solarPotential", {ardfull: feature.getMappedProperties().adrfull}) }}</strong></h6>
        <p
            v-if="feature.getMappedProperties().area_pv_m2 > 0"
            v-html="$t('modules.tools.gfi.themes.solaratlas.buildingSuitable', {
                area_pv_m2: feature.getMappedProperties().area_pv_m2,
                ic_mean: feature.getMappedProperties().ic_mean,
                area_ek4_p: feature.getMappedProperties().area_ek4_p,
                area_ek3_p: feature.getMappedProperties().area_ek3_p,
                area_ek2_p: feature.getMappedProperties().area_ek2_p,
                area_ek1_p: feature.getMappedProperties().area_ek1_p,
                powerp_15: feature.getMappedProperties().powerp_15,
                p_pv_15: feature.getMappedProperties().p_pv_15,
                co2_pv_15: feature.getMappedProperties().co2_pv_15,
                area_st_2a: feature.getMappedProperties().area_st_2a,
                area_st_1a: feature.getMappedProperties().area_st_1a,
                p_st_mwh_a: feature.getMappedProperties().p_st_mwh_a
            })"
        >
        </p>
        <p
            v-else
            v-html="$t('modules.tools.gfi.themes.solaratlas.buildingUnsuitable', {
                area_st_2a: feature.getMappedProperties().area_st_2a,
                area_st_1a: feature.getMappedProperties().area_st_1a,
                p_st_mwh_a: feature.getMappedProperties().p_st_mwh_a
            })"
        >
        </p>
    </div>
</template>
