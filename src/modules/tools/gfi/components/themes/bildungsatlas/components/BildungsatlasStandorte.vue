<script>
export default {
    name: "BildungsatlasStandorte",
    props: {
        feature: {
            type: Object,
            required: true
        },
        /**
         * fixes the bildungsatlas data bug: any number delivered as -0.0001 should be 0
         * @param {(String|Number)} value the value to fix
         * @returns {(String|Number)}  the fixed value
         */
        fixDataBug: {
            type: Function,
            required: true
        },
        /**
         * any value of the bildungsatlas needs to have a certain format
         * - a percentage has to have a following %
         * - a value equaling null must be shown as *g.F.
         * - any absolute value should have no decimal places
         * - any relative value should have 2 decimal places
         * @param {(String|Number)} value the value to transform
         * @param {Boolean} relative if true, a percent sign will be attached
         * @param {Number} fixedTo the number of decimal places of the returning value
         * @returns {String}  the value for the bildungsatlas based on the input
         */
        getValueForBildungsatlas: {
            type: Function,
            required: true
        },
        /**
         * checks if the given tab name is currently active
         * @param {String} tab the tab name
         * @returns {Boolean}  true if the given tab name is active
         */
        isActiveTab: {
            type: Function,
            required: true
        }
    },
    data () {
        return {
            themeType: "",

            schoolName: "",
            schoolStreet: "",
            schoolPostalcode: "",
            schoolWebsite: null,

            content: []
        };
    },
    watch: {
        feature (feature) {
            this.refreshGfi(feature);
        }
    },
    mounted () {
        this.refreshGfi(this.feature);
    },
    methods: {
        /**
         * refreshes the gfi, recalculates properties
         * @pre the Gfi shows the data of the former feature or is not initialized yet
         * @post the Gfi shows the data of the given feature
         * @param {Object} feature the feature to base the refreshed Gfi on
         * @returns {Void}  -
         */
        refreshGfi (feature) {
            const gfiFormat = feature.getGfiFormat() || {},
                format = gfiFormat.gfiBildungsatlasFormat || {},
                properties = feature.getProperties() || {};

            this.themeType = format.themeType;

            this.schoolName = properties.C_S_Name;
            this.schoolStreet = properties.C_S_Str + " " + properties.C_S_HNr;
            this.schoolPostalcode = properties.C_S_PLZ + " " + properties.C_S_Ort;

            this.schoolWebsite = {
                href: properties.C_S_HomP,
                title: properties.C_S_HomP,
                target: "_blank"
            };

            this.content = [
                {
                    key: "Sozialindex",
                    value: properties.C_S_SI.toString() !== "-1" ? properties.C_S_SI : "nicht vergeben"
                },
                {
                    key: "Schwerpunktschule",
                    value: properties.SchPu_PrSt === 0 ? "nein" : "ja"
                },
                {
                    key: "Schule mit Zweigstelle",
                    value: properties.C_S_Zweig
                },
                {
                    key: "Schule mit Vorschulklasse",
                    value: properties.C_S_SuS_ES === 0 ? "nein" : "ja"
                },
                {
                    key: "Schule mit Ganztagesangebot",
                    value: properties.C_S_GTA === 0 ? "nein" : "ja"
                },
                {
                    key: "Anzahl Schüler am Standort",
                    value: this.getValueForBildungsatlas(properties.C_S_SuS - properties.C_S_SuS_ES, false, 0)
                },
                {
                    key: "davon in der Primarstufe",
                    value: this.getValueForBildungsatlas(properties.C_S_SuS_PS, false, 0),
                    sublist: true
                },
                {
                    key: "davon in der Sekundarstufe I",
                    value: this.getValueForBildungsatlas(properties.C_S_SuS_S1, false, 0),
                    sublist: true
                },
                {
                    key: "davon in der Sekundarstufe II",
                    value: this.getValueForBildungsatlas(properties.C_S_SuS_S2, false, 0),
                    sublist: true
                }
            ];

            if (this.getValueForBildungsatlas(properties.Schule_SuS, false, 0) !== this.getValueForBildungsatlas(properties.C_S_SuS, false, 0)) {
                this.content.push({
                    key: "Gesamtanzahl der Schüler an allen Standorten",
                    value: this.getValueForBildungsatlas(properties.Schule_SuS, false, 0)
                });
                this.content.push({
                    key: "davon in der Primarstufe",
                    value: this.getValueForBildungsatlas(properties.Schule_PS, false, 0),
                    sublist: true
                });
                this.content.push({
                    key: "davon in der Sekundarstufe I",
                    value: this.getValueForBildungsatlas(properties.Schule_S1, false, 0),
                    sublist: true
                });
                this.content.push({
                    key: "davon in der Sekundarstufe II",
                    value: this.getValueForBildungsatlas(properties.Schule_S2, false, 0),
                    sublist: true
                });
            }
        }
    }
};
</script>

<template>
    <div class="gfi-standorte">
        <div
            class="tab-panel"
            :class="{ 'hidden': !isActiveTab('data') }"
        >
            <table class="table table-striped tableStandort">
                <thead>
                    <tr>
                        <th colspan="2">
                            {{ schoolName }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="2">
                            <span>{{ schoolStreet }}</span>
                            <br />
                            <span>{{ schoolPostalcode }}</span>
                        </td>
                    </tr>
                    <tr
                        v-for="(obj, idx) in content"
                        :key="idx"
                    >
                        <td
                            :class="{ 'sublist': obj.sublist }"
                            v-html="obj.key"
                        ></td>
                        <td>{{ obj.value }}</td>
                    </tr>
                    <tr>
                        <td>Website</td>
                        <td>
                            <a
                                v-if="schoolWebsite !== null && typeof schoolWebsite === 'object'"
                                :href="schoolWebsite.href"
                                :target="schoolWebsite.target"
                            >
                                {{ schoolWebsite.title }}
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="footer">
                <p>
                    Sie können die Position des Fensters durch Drag&#38;Drop ändern.
                </p>
            </div>
        </div>
        <div
            class="tab-panel gfi-info"
            :class="{ 'hidden': !isActiveTab('info') }"
        >
            <div v-if="themeType === '1-4'">
                <p>
                    <b>Schulstandorte mit Jahrgängen 1 bis 4:</b>
                </p>
                <br>
                <p>
                    Aufgeführt sind alle Grundschulen des allgemeinbildenden Schulsystems* sowie Sonderschulen
                    und Stadtteilschulen mit einer Primarstufe**.
                </p>
                <br>
                <p>
                    <b>Stadtteilschulen mit Schülerinnen und Schülern in der Primarstufe:</b>
                </p>
                <p>
                    Im Schuljahr 2015/16 gibt es in Hamburg insgesamt 25 Stadtteilschulen mit Schülerinnen
                    und Schülern in der Primarstufe. Hierbei handelt es sich um Stadtteilschulen, die gleichzeitig
                    auch einen Grundschulbereich unterhalten. Von den 25 Stadtteilschulen sind 13 Schulen staatlich
                    und 12 Schulen nicht-staatlich.
                </p>
                <br>
                <p>
                    <b>Sonderschulen und ReBBZs:</b>
                </p>
                <p>
                    Seit der Umsetzung inklusiver Bildung an Hamburgs Schulen umfassen die Sonderschulen nur
                    noch die speziellen Sonderschulen. Die Angebote der früheren Förder- und Sprachheilschulen,
                    die vor 2012 auch zu den Sonderschulen zählten, wurden gemeinsam mit den Angeboten der
                    Regionalen Beratungs- und Unterstützungsstellen (REBUS) 2012 in den Regionalen Bildungs-
                    und Beratungszentren (ReBBZ) zu einem Angebot zusammengeführt. Auf der Karte dargestellt
                    sind die ReBBZ unter der Schulform Sonderschule. Ausgewiesen werden nur Hauptstandorte an
                    denen auch Kinder beschult werden. Weitere Standorte der Beratung werden in der Karte nicht
                    ausgewiesen.
                </p>
                <br>
                <p>
                    <b>* Allgemeinbildende Schulen</b> vermitteln im Primarbereich die Grundlagen für eine
                    weiterführende Bildung, im Sekundarbereich I und II eine allgemeine Grundbildung bzw.
                    vertiefte Allgemeinbildung. Zu den allgemeinbildenden Schulen der im Bildungsatlas
                    abgebildeten Primarstufe und der Sekundarstufe I gehören in Hamburg Grundschulen,
                    Stadtteilschulen, Gymnasien sowie Sonderschulen.
                </p>
                <br>
                <p>
                    <b>** Primarstufe:</b> Die Jahrgangsstufen 1 bis 4.
                </p>
            </div>
            <div v-else-if="themeType === '5'">
                <p>
                    <b>Standorte der weiterführenden Schulen:</b>
                </p>
                <p>
                    Aufgeführt sind alle Standorte von Schulen der Sekundarstufe I (Stadtteilschule,
                    Gymnasium, Sonderschule).
                </p>
                <br>
                <p>
                    <b>Sonderschulen und ReBBZs:</b>
                </p>
                <p>
                    Seit der Umsetzung inklusiver Bildung an Hamburgs Schulen umfassen die Sonderschulen
                    nur noch die speziellen Sonderschulen. Die Angebote der früheren Förder- und
                    Sprachheilschulen, die vor 2012 auch zu den Sonderschulen zählten, wurden gemeinsam mit
                    den Angeboten der Regionalen Beratungs- und Unterstützungsstellen (REBUS) 2012 in den
                    Regionalen Bildungs- und Beratungszentren (ReBBZ) zu einem Angebot zusammengeführt.
                    Auf der Karte dargestellt sind die ReBBZ unter der Schulform Sonderschule. Ausgewiesen
                    werden nur Hauptstandorte an denen auch Kinder beschult werden. Weitere Standorte der
                    Beratung werden in der Karte nicht ausgewiesen.
                </p>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.gfi-standorte {
    max-width: 420px;
    table {
        &.table {
            tbody {
                tr{
                    td {
                        &:last-child {
                            text-align: right;
                        }
                    }
                    &:last-child {
                        border-bottom: 1px solid #ddd;
                    }
                }
            }
        }
    }
    .tableStandort {
        margin-top: 10px;
    }
    td.sublist {
        padding-left: 20px;
    }

    .gfi-info {
        margin-top: 10px;
        padding: 0 10px 10px;
    }
    .hidden {
        display: none;
    }
    .footer {
        margin: 0 0 10px 10px;
    }
}
</style>
