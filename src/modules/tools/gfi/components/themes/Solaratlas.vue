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
    <div v-if="feature.getMappedProperties().area_pv_m2 > 0">
        <h6><strong>Solarpotential des Gebäudes: {{ feature.getMappedProperties().adrfull }}</strong></h6>
        <p>
            Die Gesamteignungsfläche des Gebäudes beträgt {{ feature.getMappedProperties().area_pv_m2 }} m².
            Die mittlere Strahlungsmenge unter Berücksichtigung der Verschattung für dieses Gebäude beträgt {{ feature.getMappedProperties().ic_mean }} kWh/m²a.<br><br>
            <b>Photovoltaik</b> - Installierbare PV-Fläche<br>
            sehr gut geeignet (EK4): {{ feature.getMappedProperties().area_ek4_p }} m²<br>
            gut geeignet (EK3): {{ feature.getMappedProperties().area_ek3_p }} m²<br>
            geeignet (EK2): {{ feature.getMappedProperties().area_ek2_p }} m²<br>
            bedingt geeignet (EK1): {{ feature.getMappedProperties().area_ek1_p }} m²<br><br>
            Auf der Dachfläche kann eine PV-Anlage mit einer Peakleistung von ca. {{ feature.getMappedProperties().powerp_15 }} kWp installiert werden.<br>
            Der prognostizierte Stromertrag der PV-Anlage beträgt ca. {{ feature.getMappedProperties().p_pv_15 }} MWh/a.<br>
            Die mögliche CO2-Einsparung beträgt {{ feature.getMappedProperties().co2_pv_15 }} t/a.<br><br>
            Die Angaben beziehen sich auf die Verwendung eines Solarmoduls mit 15 % Wirkungsgrad und einer Anlageneffektivität (Performance Ratio) von 80 %.<br><br>
            <b>Solarthermie </b> - Installierbare Solarthermiefläche
            sehr gut geeignet (EK2): {{ feature.getMappedProperties().area_st_2a }} m²<br>
            gut geeignet (EK1): {{ feature.getMappedProperties().area_st_1a }} m²<br><br>
            Der mögliche Wärmeertrag beträgt  {{ feature.getMappedProperties().p_st_mwh_a }} MWh/a.
        </p>
    </div>
    <div v-else>
        <h6><strong>Solarpotential des Gebäudes: {{ feature.getMappedProperties().adrfull }}</strong></h6>
        <p>
            Dieses Gebäude ist für die Einrichtung einer Photovoltaik-Anlage nicht geeignet. Gegebenenfalls kann jedoch eine Solarthermie-Anlage nutzbringend betrieben werden.<br><br>
            <b>Solarthermie </b> - Installierbare Solarthermiefläche<br>
            sehr gut geeignet (EK2): {{ feature.getMappedProperties().area_st_2a }} m²<br>
            gut geeignet (EK1): {{ feature.getMappedProperties().area_st_1a }} m²<br><br>
            Der mögliche Wärmeertrag beträgt  {{ feature.getMappedProperties().p_st_mwh_a }} MWh/a.
        </p>
    </div>
</template>
