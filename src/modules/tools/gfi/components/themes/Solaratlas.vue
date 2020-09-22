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
        <div v-if="feature.getMappedProperties().area_pv_m2 > 0">
            {{ $t("modules.tools.gfi.themes.solaratlas.buildingSuitable", {
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
            }) }}
        </div>
        <p v-else>
            Dieses Gebäude ist für die Einrichtung einer Photovoltaik-Anlage nicht geeignet. Gegebenenfalls kann jedoch eine Solarthermie-Anlage nutzbringend betrieben werden.<br><br>
            <b>Solarthermie </b> - Installierbare Solarthermiefläche<br>
            sehr gut geeignet (EK2): {{ feature.getMappedProperties().area_st_2a }} m²<br>
            gut geeignet (EK1): {{ feature.getMappedProperties().area_st_1a }} m²<br><br>
            Der mögliche Wärmeertrag beträgt  {{ feature.getMappedProperties().p_st_mwh_a }} MWh/a.
        </p>
    </div>
</template>
