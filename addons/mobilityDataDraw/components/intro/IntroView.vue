<script>
import { mapActions, mapMutations } from "vuex";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import mutations from "../../store/mutationsMobilityDataDraw";

export default {
    name: "IntroView",
    components: {},
    data() {
        return {
            constants: { ...toolConstants, ...sharedConstants },
            termsAccepted: false,
            showDialog: false,
            lang: i18next.language
        };
    },
    computed: {},
    methods: {
        ...mapMutations("Tools/MobilityDataDraw", ["setView"]),
        ...mapActions("Tools/MobilityDataDraw", ["resetDrawnData"]),
        ...mapMutations("Language", ["setCurrentLocale"]),

        /**
         * Switch language
         * @returns {void}
         */
        switchLanguage() {
            const language = i18next.language === 'en' ? 'de' : 'en'
            i18next.changeLanguage(language, () => {
                this.setCurrentLocale(language);
            });
        },
        /**
         * If terms have been accepted, continue
         * @returns {void}
         */
        startDrawing() {
            this.setView(this.constants.views.ANNOTATIONS_VIEW);
        },
        /**
         * If terms have been accepted, continue
         * @returns {void}
         */
        getLanguage() {
            return i18next.language;
        }
    }
};
</script>

<template lang="html">
    <div id="tool-mobilityDataDraw-view-intro">
        <h4>
            {{ $t("additional:modules.tools.mobilityDataDraw.intro.greeting") }}
        </h4>

        <p class="intro-text">
            {{
                $t("additional:modules.tools.mobilityDataDraw.intro.message")
            }}
        </p>

        <v-btn @click="switchLanguage">
            {{
                $t("additional:modules.tools.mobilityDataDraw.intro.language")
            }}
        </v-btn>
        <div class="terms-holder">
            <v-checkbox
                v-model="termsAccepted"
            ></v-checkbox>
            <div v-if="getLanguage() === 'de'">
                <a href="javascript:void(0);" v-on:click="showDialog = !showDialog">{{ $t('additional:modules.tools.mobilityDataDraw.intro.acceptTerms1') }}</a>
            {{ $t('additional:modules.tools.mobilityDataDraw.intro.acceptTerms2') }}
            </div>
            <div v-else>
                {{ $t('additional:modules.tools.mobilityDataDraw.intro.acceptTerms1') }}
                <a href="javascript:void(0);" v-on:click="showDialog = !showDialog">{{ $t('additional:modules.tools.mobilityDataDraw.intro.acceptTerms2') }}</a>
            </div>
        </div>

        <v-btn
            @click="startDrawing"
            :disabled="!termsAccepted"
        >
            {{
                $t("additional:modules.tools.mobilityDataDraw.intro.startTool")
            }}
        </v-btn>

        <v-dialog
            v-model="showDialog"
            transition="dialog-top-transition"
            max-width="600"
        >
            <v-card>
                <v-card-title class="text-h5 grey lighten-2">
                    Privacy Policy
                </v-card-title>

                <v-card-text class="data-policy-text">
                    <h1 style="padding-top: 3pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">
                        Datenschutzerklärung „Storytelling &amp; Data Collection Tool“</h1>
                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                    <p class="s1" style="padding-left: 5pt;text-indent: 0pt;text-align: left;">(Stand: 25.11.2021)</p>
                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                    <ol id="l1">
                        <li><h2 style="padding-left: 27pt;text-indent: -21pt;text-align: left;">Name und Anschrift des
                            Verantwortlichen</h2>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 115%;text-align: justify;">Der
                                Verantwortliche im Sinne der Datenschutz-Grundverordnung und anderer nationaler
                                Datenschutzgesetze der Mitgliedsstaaten sowie sonstiger datenschutzrechtlicher
                                Bestimmungen ist die:</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p class="s2"
                               style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: left;">
                                CityScienceLab HafenCity Universität</p>
                            <p class="s2"
                               style="padding-left: 5pt;text-indent: 0pt;line-height: 14pt;text-align: left;">
                                Henning-Voscherau-Platz 1</p>
                            <p style="padding-top: 2pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">20457
                                Hamburg</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p class="s2" style="padding-left: 5pt;text-indent: 0pt;text-align: left;">Michael Ziehl
                                (michael.ziehl@hcu-hamburg.de)</p>
                            <p class="s2"
                               style="padding-top: 2pt;padding-left: 5pt;text-indent: 0pt;line-height: 229%;text-align: left;">
                                Martin Niggemann (martin.niggemann@hcu-hamburg.de) Tel.: <span class="p">+49 (0)40 4 28 27</span>
                            </p></li>
                        <li><h2 style="padding-left: 27pt;text-indent: -21pt;line-height: 13pt;text-align: left;">Name
                            und Anschrift des Datenschutzbeauftragten</h2>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;text-align: left;">Der Datenschutzbeauftragte
                                des Verantwortlichen ist:</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p class="s2"
                               style="padding-left: 5pt;text-indent: 0pt;line-height: 117%;text-align: left;">Christian
                                Brettschneider (interimsweise) Leitung HCU-IT Infrastruktur und Technik</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p class="s2" style="padding-left: 5pt;text-indent: 0pt;text-align: left;">
                                Henning-Voscherau-Platz 1</p>
                            <p class="s2" style="padding-top: 2pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">
                                20457 Hamburg</p>
                            <p class="s2" style="padding-top: 2pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">
                                R. 5.003</p>
                            <p class="s2" style="padding-top: 2pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">
                                Tel.: +49 (0)40 4 28 27- 4029 - 5250</p>
                            <p style="padding-top: 2pt;padding-left: 5pt;text-indent: 0pt;text-align: left;"><a
                                href="mailto:christian.brettschneider@vw.hcu-hamburg.de">christian.brettschneider@vw.hcu-hamburg.de</a>
                            </p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                        <li><h2 style="padding-top: 4pt;padding-left: 27pt;text-indent: -21pt;text-align: left;">
                            Allgemeines zur Datenverarbeitung</h2>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <ol id="l2">
                                <li><h3 style="padding-left: 27pt;text-indent: -21pt;text-align: left;">Umfang der
                                    Verarbeitung personenbezogener Daten</h3>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                    <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: left;">
                                        Wir verarbeiten lediglich die personenbeziehbaren Daten, die abgefragt und durch
                                        die Nutzenden freiwillig eingegeben werden.</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                    <p style="padding-left: 76pt;text-indent: 0pt;line-height: 114%;text-align: left;">
                                        Jedem Mobilitätsdatensatz (s.o.) wird ein Steckbrief vorangestellt, der folgende
                                        Informationen enthält:</p>
                                    <ul id="l3">
                                        <li><p class="s3"
                                               style="padding-left: 94pt;text-indent: -18pt;line-height: 13pt;text-align: left;">
                                            ID (1,2,3 / a,b,c)</p></li>
                                        <li><p class="s3"
                                               style="padding-top: 3pt;padding-left: 94pt;text-indent: -18pt;text-align: left;">
                                            Alter in 10-jahres Kategorien (1-9; 10-19;,)</p></li>
                                        <li><p class="s3"
                                               style="padding-left: 94pt;text-indent: -18pt;text-align: left;">Gender (m
                                            / w /d )</p></li>
                                        <li><p class="s3"
                                               style="padding-left: 94pt;text-indent: -18pt;text-align: left;">
                                            Familienstand (LD, VH, VW, GS,..)</p>
                                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                        <li><p class="s3"
                                               style="padding-left: 94pt;text-indent: -18pt;text-align: left;">
                                            Erwerbstätigkeit (auch nicht erwerbstätig als Option) (text)</p></li>
                                        <li><p class="s3"
                                               style="padding-left: 94pt;text-indent: -18pt;text-align: left;">
                                            Haushalts-Einkommensklassen (Kategorien)</p></li>
                                        <li><p class="s3"
                                               style="padding-left: 94pt;text-indent: -18pt;text-align: left;">Um wen
                                            kümmern Sie sich? [Personenklasse (Kind, Eltern, Bekannter, ...)</p>
                                            <p class="s3" style="padding-left: 94pt;text-indent: 0pt;text-align: left;">
                                                + Alter + im gleichen Haushalt?]</p>
                                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                            <p class="s3" style="padding-left: 76pt;text-indent: 0pt;text-align: left;">
                                                Zudem wird der jeweilige Zeitpunkt der Erfassung der Daten (Datum und
                                                Uhrzeit) gespeichert.</p>
                                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                            <p class="s3" style="padding-left: 76pt;text-indent: 0pt;text-align: left;">
                                                Ein Mobilitätsdatensatz besteht aus:</p>
                                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                            <ul id="l4">
                                                <li><h4 style="padding-left: 77pt;text-indent: -18pt;text-align: left;">
                                                    Wege auf einer Karte – Polylinie <span class="s3">(Wege werden auf der Karte eingezeichnet)</span>
                                                </h4>
                                                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                                    <ul id="l5">
                                                        <li><p class="s3"
                                                               style="padding-left: 94pt;text-indent: -18pt;text-align: left;">
                                                            Wegzeit für die zurückgelegte Strecke (wie lange?)</p></li>
                                                        <li><p class="s3"
                                                               style="padding-left: 94pt;text-indent: -18pt;text-align: left;">
                                                            Tageszeit zu der die Strecke zurückgelegt wurde (wann?)</p>
                                                        </li>
                                                        <li><p class="s3"
                                                               style="padding-left: 94pt;text-indent: -18pt;text-align: left;">
                                                            Genutztes Verkehrsmittel</p></li>
                                                        <li><p class="s3"
                                                               style="padding-left: 94pt;text-indent: -18pt;line-height: 13pt;text-align: left;">
                                                            Kosten für die Verkehrsmittel</p></li>
                                                        <li><p class="s3"
                                                               style="padding-left: 94pt;text-indent: -18pt;line-height: 13pt;text-align: left;">
                                                            Ggf. Begleitung</p></li>
                                                        <li><p class="s3"
                                                               style="padding-left: 94pt;text-indent: -18pt;text-align: left;">
                                                            Emotionen auf der Wegstrecke (z.B. via Smiley)</p></li>
                                                        <li><p class="s3"
                                                               style="padding-left: 94pt;text-indent: -18pt;text-align: left;">
                                                            Orte, die in einem direkten oder Indirekten Bezug zu der
                                                            Wegstrecke stehen.</p>
                                                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                                    </ul>
                                                </li>
                                                <li><h4 style="padding-left: 77pt;text-indent: -18pt;text-align: left;">
                                                    Stoppunkte <span
                                                    class="s3">(Punkte werden auf der Karte gesetzt)</span></h4>
                                                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                                    <ul id="l6">
                                                        <li><p class="s3"
                                                               style="padding-left: 97pt;text-indent: -21pt;line-height: 13pt;text-align: left;">
                                                            Aufenthaltsdauer an dem Stoppunkt</p></li>
                                                        <li><p class="s3"
                                                               style="padding-left: 97pt;text-indent: -21pt;line-height: 13pt;text-align: left;">
                                                            Zeitpunkt des Stops</p></li>
                                                        <li><p class="s3"
                                                               style="padding-left: 97pt;text-indent: -21pt;text-align: left;">
                                                            Grund für den Stop</p>
                                                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                                    </ul>
                                                </li>
                                                <li><h4
                                                    style="padding-left: 77pt;text-indent: -18pt;line-height: 13pt;text-align: left;">
                                                    Kommentare <span
                                                    class="s3">(Freitext oder als Sprachnachricht)</span></h4>
                                                    <ul id="l7">
                                                        <li><p class="s3"
                                                               style="padding-left: 97pt;text-indent: -21pt;line-height: 13pt;text-align: left;">
                                                            Qualitative Information</p></li>
                                                        <li><p class="s3"
                                                               style="padding-left: 97pt;text-indent: -21pt;line-height: 13pt;text-align: left;">
                                                            Annotationen</p></li>
                                                    </ul>
                                                </li>
                                            </ul>
                                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">
                                                Darüber hinaus werden im Hintergrund grundsätzlich und ausschließlich
                                                nur Daten erfasst und verarbeitet, die für die Bereitstellung und
                                                Funktionsfähigkeit der Website notwendig sind.</p>
                                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                    </ul>
                                </li>
                                <li><h3 style="padding-left: 27pt;text-indent: -21pt;text-align: left;">Rechtsgrundlage
                                    für die Verarbeitung personenbezogener Daten</h3>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                    <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">
                                        Das Projekt CUT, in das die Datenverarbeitung eingebettet ist, ist ein
                                        Forschungsprojekt und das CityScienceLab der HCU ist neben anderen Hochschulen
                                        Teil des Projektkonsortiums. Die Daten werden demensprechend ausschließlich zum
                                        Zweck der Forschung erhoben und verarbeitet.</p>
                                    <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">
                                        Forschungsaktivitäten werden laut <b>§11 Hamburgisches Datenschutzgesetz </b>(vor
                                        Mai 2018 war es §27 HmBDSG) als „Besondere Verarbeitungstätigkeiten“ bezeichnet
                                        und legitimiert.</p>
                                    <p style="padding-top: 3pt;padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">
                                        Darüber hinaus findet <b>Art. 89 Abs. 1 DSGVO </b>Anwendung (Daten, die zu
                                        wissenschaftlichen oder historischen Forschungszwecken oder zu statistischen
                                        Zwecken erhoben werden).</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><h3 style="padding-left: 27pt;text-indent: -21pt;text-align: left;">Datenlöschung
                                    und Speicherdauer</h3>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                    <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">
                                        Die personenbezogenen Daten der betroffenen Person werden gelöscht oder
                                        gesperrt, sobald der Zweck der Speicherung entfällt. Dies ist der Fall, wenn sie
                                        für die Aufgabenerfüllung bzw. das Forschungsvorhaben nicht mehr erforderlich
                                        sind und geschieht spätestens zum Ende der Projektlaufzeit (§75 Abs. 2 BDSG).
                                        Eine Speicherung kann darüber hinaus erfolgen, wenn dies durch den europäischen
                                        oder nationalen Gesetzgeber in unionsrechtlichen Verordnungen, Gesetzen oder
                                        sonstigen Vorschriften, denen der Verantwortliche unterliegt, vorgesehen wurde.
                                        Eine Sperrung oder Löschung der Daten erfolgt auch dann, wenn eine durch die
                                        genannten Normen vorgeschriebene Speicherfrist abläuft, es sei denn, dass eine
                                        Erforderlichkeit zur weiteren Speicherung der Daten für einen Vertragsabschluss
                                        oder eine Vertragserfüllung besteht.</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                            </ol>
                        </li>
                        <li><h2 style="padding-left: 27pt;text-indent: -21pt;text-align: left;">Bereitstellung der
                            Website und Erstellung von Logfiles</h2>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Beim
                                Aufrufen der Website werden keine Logfiles erstellt und demnach werden auch keine
                                Informationen vom Computersystem des aufrufenden Rechners erhoben.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                        <li><h2 style="padding-left: 27pt;text-indent: -21pt;text-align: left;">Verwendung von
                            Cookies</h2>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;text-align: justify;">Die Webseite verwendet
                                keine Cookies.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                        <li><h2 style="padding-left: 27pt;text-indent: -21pt;text-align: left;">Verarbeitung von Daten
                            zur Analyse des Surfverhaltens</h2>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;text-align: justify;">Es findet keinerlei
                                Analyse des Surfverhaltens statt.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                        <li><h2 style="padding-left: 27pt;text-indent: -21pt;text-align: left;">Rechte der betroffenen
                            Person</h2></li>
                    </ol>
                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                    <p class="s2" style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Die
                        folgende Auflistung umfasst alle Rechte der Betroffenen nach der DSGVO. Rechte, die für die
                        eigene Webseite keine Relevanz haben, müssen nicht genannt werden. Insoweit kann die Auflistung
                        gekürzt werden.</p>
                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                    <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Werden
                        personenbezogene Daten von Ihnen verarbeitet, sind Sie Betroffener i.S.d. DSGVO und es stehen
                        Ihnen folgende Rechte gegenüber dem Verantwortlichen zu:</p>
                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                    <ol id="l8">
                        <li><h3 style="padding-left: 27pt;text-indent: -21pt;text-align: left;">Auskunftsrecht</h3>
                            <p style="padding-top: 3pt;padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">
                                Sie können von dem Verantwortlichen eine Bestätigung darüber verlangen, ob
                                personenbezogene Daten, die Sie betreffen, von uns verarbeitet werden.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Liegt
                                eine solche Verarbeitung vor, können Sie von dem Verantwortlichen über folgende
                                Informationen Auskunft verlangen:</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <ol id="l9">
                                <li><p style="padding-left: 41pt;text-indent: -35pt;text-align: left;">die Zwecke, zu
                                    denen die personenbezogenen Daten verarbeitet werden;</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p style="padding-left: 41pt;text-indent: -35pt;text-align: left;">die Kategorien
                                    von personenbezogenen Daten, welche verarbeitet werden;</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                    die Empfänger bzw. die Kategorien von Empfängern, gegenüber denen die Sie
                                    betreffenden personenbezogenen Daten offengelegt wurden oder noch offengelegt
                                    werden;</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                    die geplante Dauer der Speicherung der Sie betreffenden personenbezogenen Daten
                                    oder, falls konkrete Angaben hierzu nicht möglich sind, Kriterien für die Festlegung
                                    der Speicherdauer;</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                    das Bestehen eines Rechts auf Berichtigung oder Löschung der Sie betreffenden
                                    personenbezogenen Daten, eines Rechts auf Einschränkung der Verarbeitung durch den
                                    Verantwortlichen oder eines Widerspruchsrechts gegen diese Verarbeitung;</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p style="padding-left: 41pt;text-indent: -35pt;text-align: left;">das Bestehen
                                    eines Beschwerderechts bei einer Aufsichtsbehörde;</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                    alle verfügbaren Informationen über die Herkunft der Daten, wenn die
                                    personenbezogenen Daten nicht bei der betroffenen Person erhoben werden;</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 117%;text-align: justify;">
                                    das Bestehen einer automatisierten Entscheidungsfindung einschließlich Profiling
                                    gemäß Art. 22 Abs. 1 und 4 DSGVO und – zumindest in diesen Fällen</p></li>
                            </ol>
                            <p style="padding-left: 41pt;text-indent: 0pt;line-height: 114%;text-align: justify;">–
                                aussagekräftige Informationen über die involvierte Logik sowie die Tragweite und die
                                angestrebten Auswirkungen einer derartigen Verarbeitung für die betroffene Person.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Ihnen
                                steht das Recht zu, Auskunft darüber zu verlangen, ob die Sie betreffenden
                                personenbezogenen Daten in ein Drittland oder an eine internationale Organisation
                                übermittelt werden. In diesem Zusammenhang können Sie verlangen, über die geeigneten
                                Garantien gem. Art. 46 DSGVO im Zusammenhang mit der Übermittlung unterrichtet zu
                                werden.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 1pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Dieses
                                Auskunftsrecht kann insoweit beschränkt werden, als es voraussichtlich die
                                Verwirklichung der Forschungs- oder Statistikzwecke unmöglich macht oder ernsthaft
                                beeinträchtigt und die Beschränkung für die Erfüllung der Forschungs- oder
                                Statistikzwecke notwendig ist.</p>
                            <p style="padding-left: 39pt;text-indent: 0pt;text-align: left;"/></li>
                        <li><h3 style="padding-top: 3pt;padding-left: 27pt;text-indent: -21pt;text-align: left;">Recht
                            auf Berichtigung</h3>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Sie
                                haben ein Recht auf Berichtigung und/oder Vervollständigung gegenüber dem
                                Verantwortlichen, sofern die verarbeiteten personenbezogenen Daten, die Sie betreffen,
                                unrichtig oder unvollständig sind. Der Verantwortliche hat die Berichtigung unverzüglich
                                vorzunehmen.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 1pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Ihr
                                Recht auf Berichtigung kann insoweit beschränkt werden, als es voraussichtlich die
                                Verwirklichung der Forschungs- oder Statistikzwecke unmöglich macht oder ernsthaft
                                beeinträchtigt und die Beschränkung für die Erfüllung der Forschungs- oder
                                Statistikzwecke notwendig ist.</p>
                            <p style="padding-left: 39pt;text-indent: 0pt;text-align: left;"/>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                        <li><h3 style="padding-top: 4pt;padding-left: 27pt;text-indent: -21pt;text-align: left;">Recht
                            auf Einschränkung der Verarbeitung</h3>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Unter
                                den folgenden Voraussetzungen können Sie die Einschränkung der Verarbeitung der Sie
                                betreffenden personenbezogenen Daten verlangen:</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <ol id="l10">
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 115%;text-align: justify;">
                                    wenn Sie die Richtigkeit der Sie betreffenden personenbezogenen für eine Dauer
                                    bestreiten, die es dem Verantwortlichen ermöglicht, die Richtigkeit der
                                    personenbezogenen Daten zu überprüfen;</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                    die Verarbeitung unrechtmäßig ist und Sie die Löschung der personenbezogenen Daten
                                    ablehnen und stattdessen die Einschränkung der Nutzung der personenbezogenen Daten
                                    verlangen;</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                    der Verantwortliche die personenbezogenen Daten für die Zwecke der Verarbeitung
                                    nicht länger benötigt, Sie diese jedoch zur Geltendmachung,</p>
                                    <p style="padding-left: 41pt;text-indent: 0pt;line-height: 14pt;text-align: left;">
                                        Ausübung oder Verteidigung von Rechtsansprüchen benötigen, oder</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 115%;text-align: justify;">
                                    wenn Sie Widerspruch gegen die Verarbeitung gemäß Art. 21 Abs. 1 DSGVO eingelegt
                                    haben und noch nicht feststeht, ob die berechtigten Gründe des Verantwortlichen
                                    gegenüber Ihren Gründen überwiegen.</p></li>
                            </ol>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Wurde
                                die Verarbeitung der Sie betreffenden personenbezogenen Daten eingeschränkt, dürfen
                                diese Daten – von ihrer Speicherung abgesehen – nur mit Ihrer Einwilligung oder zur
                                Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen oder zum Schutz der
                                Rechte einer anderen natürlichen oder juristischen Person oder aus Gründen eines
                                wichtigen öffentlichen Interesses der Union oder eines Mitgliedstaats verarbeitet
                                werden.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Wurde
                                die Einschränkung der Verarbeitung nach den o.g. Voraussetzungen eingeschränkt, werden
                                Sie von dem Verantwortlichen unterrichtet bevor die Einschränkung aufgehoben wird.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-top: 4pt;padding-left: 39pt;text-indent: 0pt;text-align: left;"><span
                                class="s4" style=" background-color: #EDEDED;"> </span><span class="s5"
                                                                                             style=" background-color: #EDEDED;">Ihr Recht auf Einschränkung der Verarbeitung kann insoweit beschränkt</span>
                            </p>
                            <p style="padding-top: 2pt;padding-left: 39pt;text-indent: 0pt;text-align: left;"><span
                                class="s4" style=" background-color: #EDEDED;"> </span><span class="s5"
                                                                                             style=" background-color: #EDEDED;">werden, als es voraussichtlich die Verwirklichung der Forschungs- oder</span>
                            </p>
                            <p style="padding-left: 1pt;text-indent: 0pt;line-height: 114%;text-align: justify;">
                                Statistikzwecke unmöglich macht oder ernsthaft beeinträchtigt und die Beschränkung für
                                die Erfüllung der Forschungs- oder Statistikzwecke notwendig ist.</p>
                            <p style="padding-left: 39pt;text-indent: 0pt;text-align: left;"/>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                        <li><h3 style="padding-top: 4pt;padding-left: 27pt;text-indent: -21pt;text-align: left;">Recht
                            auf Löschung</h3>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <ol id="l11">
                                <li><p class="s6" style="padding-left: 27pt;text-indent: -21pt;text-align: left;">
                                    Löschungspflicht</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                    <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">
                                        Sie können von dem Verantwortlichen verlangen, dass die Sie betreffenden
                                        personenbezogenen Daten unverzüglich gelöscht werden, und der Verantwortliche
                                        ist verpflichtet, diese Daten unverzüglich zu löschen, sofern einer der
                                        folgenden Gründe zutrifft:</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                    <ol id="l12">
                                        <li><p
                                            style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                            Die Sie betreffenden personenbezogenen Daten sind für die Zwecke, für die
                                            sie erhoben oder auf sonstige Weise verarbeitet wurden, nicht mehr
                                            notwendig.</p>
                                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                        <li><p
                                            style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                            Sie widerrufen Ihre Einwilligung, auf die sich die Verarbeitung gem. Art. 6
                                            Abs. 1 lit. a oder Art. 9 Abs. 2 lit. a DSGVO stützte, und es fehlt an einer
                                            anderweitigen Rechtsgrundlage für die Verarbeitung.</p>
                                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                        <li><p
                                            style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                            Sie legen gem. Art. 21 Abs. 1 DSGVO Widerspruch gegen die Verarbeitung ein
                                            und es liegen keine vorrangigen berechtigten Gründe für die Verarbeitung
                                            vor, oder Sie legen gem. Art. 21 Abs. 2 DSGVO Widerspruch gegen die
                                            Verarbeitung ein.</p>
                                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                        <li><p
                                            style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: left;">
                                            Die Sie betreffenden personenbezogenen Daten wurden unrechtmäßig
                                            verarbeitet.</p>
                                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                        <li><p
                                            style="padding-left: 41pt;text-indent: -35pt;line-height: 115%;text-align: justify;">
                                            Die Löschung der Sie betreffenden personenbezogenen Daten ist zur Erfüllung
                                            einer rechtlichen Verpflichtung nach dem Unionsrecht oder dem Recht der
                                            Mitgliedstaaten erforderlich, dem der Verantwortliche unterliegt.</p>
                                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                        <li><p
                                            style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                            Die Sie betreffenden personenbezogenen Daten wurden in Bezug auf angebotene
                                            Dienste der Informationsgesellschaft gemäß Art. 8 Abs. 1 DSGVO erhoben.</p>
                                        </li>
                                    </ol>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p class="s6" style="padding-left: 27pt;text-indent: -21pt;text-align: left;">
                                    Information an Dritte</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                    <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">
                                        Hat der Verantwortliche die Sie betreffenden personenbezogenen Daten öffentlich
                                        gemacht und ist er gem. Art. 17 Abs. 1 DSGVO zu deren Löschung verpflichtet, so
                                        trifft er unter Berücksichtigung der verfügbaren Technologie und der
                                        Implementierungskosten angemessene Maßnahmen, auch technischer Art, um für die
                                        Datenverarbeitung Verantwortliche, die die personenbezogenen Daten verarbeiten,
                                        darüber zu informieren, dass Sie als betroffene Person von ihnen die Löschung
                                        aller Links zu diesen personenbezogenen Daten oder von Kopien oder Replikationen
                                        dieser personenbezogenen Daten verlangt haben.</p></li>
                                <li><p class="s6"
                                       style="padding-top: 3pt;padding-left: 27pt;text-indent: -21pt;text-align: left;">
                                    Ausnahmen</p></li>
                            </ol>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;text-align: justify;">Das Recht auf Löschung
                                besteht nicht, soweit die Verarbeitung erforderlich ist</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <ol id="l13">
                                <li><p style="padding-left: 41pt;text-indent: -35pt;text-align: left;">zur Ausübung des
                                    Rechts auf freie Meinungsäußerung und Information;</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                    zur Erfüllung einer rechtlichen Verpflichtung, die die Verarbeitung nach dem Recht
                                    der Union oder der Mitgliedstaaten, dem der Verantwortliche unterliegt, erfordert,
                                    oder zur Wahrnehmung einer Aufgabe, die im öffentlichen Interesse liegt oder in
                                    Ausübung öffentlicher Gewalt erfolgt, die dem Verantwortlichen übertragen wurde;</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 117%;text-align: justify;">
                                    aus Gründen des öffentlichen Interesses im Bereich der öffentlichen Gesundheit gemäß
                                    Art. 9 Abs. 2 lit. h und i sowie Art. 9 Abs. 3 DSGVO;</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                    für im öffentlichen Interesse liegende Archivzwecke, wissenschaftliche oder
                                    historische Forschungszwecke oder für statistische Zwecke gem. Art. 89 Abs. 1 DSGVO,
                                    soweit das unter Abschnitt a) genannte Recht voraussichtlich die Verwirklichung der
                                    Ziele dieser Verarbeitung unmöglich macht oder ernsthaft beeinträchtigt, oder</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p style="padding-left: 41pt;text-indent: -35pt;text-align: left;">zur
                                    Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.</p></li>
                            </ol>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                        <li><h3 style="padding-left: 27pt;text-indent: -21pt;text-align: left;">Recht auf
                            Unterrichtung</h3>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Haben
                                Sie das Recht auf Berichtigung, Löschung oder Einschränkung der Verarbeitung gegenüber
                                dem Verantwortlichen geltend gemacht, ist dieser verpflichtet, allen Empfängern, denen
                                die Sie betreffenden personenbezogenen Daten offengelegt wurden, diese Berichtigung oder
                                Löschung der Daten oder Einschränkung der Verarbeitung mitzuteilen, es sei denn, dies
                                erweist sich als unmöglich oder ist mit einem unverhältnismäßigen Aufwand verbunden.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Ihnen
                                steht gegenüber dem Verantwortlichen das Recht zu, über diese Empfänger unterrichtet zu
                                werden.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                        <li><h3 style="padding-left: 27pt;text-indent: -21pt;text-align: left;">Recht auf
                            Datenübertragbarkeit</h3>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Sie
                                haben das Recht, die Sie betreffenden personenbezogenen Daten, die Sie dem
                                Verantwortlichen bereitgestellt haben, in einem strukturierten, gängigen und
                                maschinenlesbaren Format zu erhalten. Außerdem haben Sie das Recht diese Daten einem
                                anderen Verantwortlichen ohne Behinderung durch den Verantwortlichen, dem die
                                personenbezogenen Daten bereitgestellt wurden, zu übermitteln, sofern</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <ol id="l14">
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                    die Verarbeitung auf einer Einwilligung gem. Art. 6 Abs. 1 lit. a DSGVO oder Art. 9
                                    Abs. 2 lit. a DSGVO oder auf einem Vertrag gem. Art. 6 Abs. 1 lit. b DSGVO beruht
                                    und</p></li>
                                <li><p style="padding-top: 3pt;padding-left: 41pt;text-indent: -35pt;text-align: left;">
                                    die Verarbeitung mithilfe automatisierter Verfahren erfolgt.</p></li>
                            </ol>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">In
                                Ausübung dieses Rechts haben Sie ferner das Recht, zu erwirken, dass die Sie
                                betreffenden personenbezogenen Daten direkt von einem Verantwortlichen einem anderen
                                Verantwortlichen übermittelt werden, soweit dies technisch machbar ist. Freiheiten und
                                Rechte anderer Personen dürfen hierdurch nicht beeinträchtigt werden.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Das
                                Recht auf Datenübertragbarkeit gilt nicht für eine Verarbeitung personenbezogener Daten,
                                die für die Wahrnehmung einer Aufgabe erforderlich ist, die im öffentlichen Interesse
                                liegt oder in Ausübung öffentlicher Gewalt erfolgt, die dem Verantwortlichen übertragen
                                wurde.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                        <li><h3 style="padding-left: 27pt;text-indent: -21pt;text-align: left;">Widerspruchsrecht</h3>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Sie
                                haben das Recht, aus Gründen, die sich aus ihrer besonderen Situation ergeben, jederzeit
                                gegen die Verarbeitung der Sie betreffenden personenbezogenen Daten, die aufgrund von
                                Art. 6 Abs. 1 lit. e oder f DSGVO erfolgt, Widerspruch einzulegen; dies gilt auch für
                                ein auf diese Bestimmungen gestütztes Profiling.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Der
                                Verantwortliche verarbeitet die Sie betreffenden personenbezogenen Daten nicht mehr, es
                                sei denn, er kann zwingende schutzwürdige Gründe für die Verarbeitung nachweisen, die
                                Ihre Interessen, Rechte und Freiheiten überwiegen, oder die Verarbeitung dient der
                                Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Werden
                                die Sie betreffenden personenbezogenen Daten verarbeitet, um Direktwerbung zu betreiben,
                                haben Sie das Recht, jederzeit Widerspruch gegen die Verarbeitung der Sie betreffenden
                                personenbezogenen Daten zum Zwecke derartiger Werbung einzulegen; dies gilt auch für das
                                Profiling, soweit es mit solcher Direktwerbung in Verbindung steht.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 117%;text-align: justify;">
                                Widersprechen Sie der Verarbeitung für Zwecke der Direktwerbung, so werden die Sie
                                betreffenden personenbezogenen Daten nicht mehr für diese Zwecke verarbeitet.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Sie
                                haben die Möglichkeit, im Zusammenhang mit der Nutzung von Diensten der
                                Informationsgesellschaft – ungeachtet der Richtlinie 2002/58/EG – Ihr Widerspruchsrecht
                                mittels automatisierter Verfahren auszuüben, bei denen technische Spezifikationen
                                verwendet werden.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 1pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Sie
                                haben auch das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, bei
                                der Verarbeitung Sie betreffender personenbezogener Daten, die zu wissenschaftlichen
                                oder historischen Forschungszwecken oder zu statistischen Zwecken gem. Art. 89 Abs. 1
                                DSGVO erfolgt, dieser zu widersprechen.</p>
                            <p style="padding-left: 39pt;text-indent: 0pt;text-align: left;"/>
                            <p style="padding-left: 1pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Ihr
                                Widerspruchsrecht kann insoweit beschränkt werden, als es voraussichtlich die
                                Verwirklichung der Forschungs- oder Statistikzwecke unmöglich macht oder ernsthaft
                                beeinträchtigt und die Beschränkung für die Erfüllung der Forschungs- oder
                                Statistikzwecke notwendig ist.</p>
                            <p style="padding-left: 39pt;text-indent: 0pt;text-align: left;"/>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                        <li><h3 style="padding-top: 4pt;padding-left: 27pt;text-indent: -21pt;text-align: left;">Recht
                            auf Widerruf der datenschutzrechtlichen Einwilligungserklärung</h3>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Sie
                                haben das Recht, Ihre datenschutzrechtliche Einwilligungserklärung jederzeit zu
                                widerrufen. Durch den Widerruf der Einwilligung wird die Rechtmäßigkeit der aufgrund der
                                Einwilligung bis zum Widerruf erfolgten Verarbeitung nicht berührt.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                        <li><h3 style="padding-left: 27pt;text-indent: -21pt;text-align: left;">Automatisierte
                            Entscheidung im Einzelfall einschließlich Profiling</h3>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;text-align: justify;">Sie haben das Recht,
                                nicht einer ausschließlich auf einer automatisierten Verarbeitung</p>
                            <p style="padding-top: 2pt;padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">
                                – einschließlich Profiling – beruhenden Entscheidung unterworfen zu werden, die Ihnen
                                gegenüber rechtliche Wirkung entfaltet oder Sie in ähnlicher Weise erheblich
                                beeinträchtigt. Dies gilt nicht, wenn die Entscheidung</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <ol id="l15">
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                    für den Abschluss oder die Erfüllung eines Vertrags zwischen Ihnen und dem
                                    Verantwortlichen erforderlich ist,</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p
                                    style="padding-left: 41pt;text-indent: -35pt;line-height: 114%;text-align: justify;">
                                    aufgrund von Rechtsvorschriften der Union oder der Mitgliedstaaten, denen der
                                    Verantwortliche unterliegt, zulässig ist und diese Rechtsvorschriften angemessene
                                    Maßnahmen zur Wahrung Ihrer Rechte und Freiheiten sowie Ihrer berechtigten
                                    Interessen enthalten oder</p>
                                    <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                                <li><p style="padding-left: 41pt;text-indent: -35pt;text-align: left;">mit Ihrer
                                    ausdrücklichen Einwilligung erfolgt.</p></li>
                            </ol>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">
                                Allerdings dürfen diese Entscheidungen nicht auf besonderen Kategorien personenbezogener
                                Daten nach Art. 9 Abs. 1 DSGVO beruhen, sofern nicht Art. 9 Abs. 2 lit. a oder g DSGVO
                                gilt und angemessene Maßnahmen zum Schutz der Rechte und Freiheiten sowie Ihrer
                                berechtigten Interessen getroffen wurden.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p>
                            <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">
                                Hinsichtlich der in (1) und (3) genannten Fälle trifft der Verantwortliche angemessene
                                Maßnahmen, um die Rechte und Freiheiten sowie Ihre berechtigten Interessen zu wahren,
                                wozu mindestens das Recht auf Erwirkung des Eingreifens einer Person seitens des
                                Verantwortlichen, auf Darlegung des eigenen Standpunkts und auf Anfechtung der
                                Entscheidung gehört.</p>
                            <p style="text-indent: 0pt;text-align: left;"><br/></p></li>
                        <li><h3 style="padding-left: 27pt;text-indent: -21pt;text-align: left;">Recht auf Beschwerde bei
                            einer Aufsichtsbehörde</h3></li>
                    </ol>
                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                    <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Unbeschadet
                        eines anderweitigen verwaltungsrechtlichen oder gerichtlichen Rechtsbehelfs steht Ihnen das
                        Recht auf Beschwerde bei einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres
                        Aufenthaltsorts, ihres Arbeitsplatzes oder des</p>
                    <p style="padding-top: 3pt;padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">
                        Orts des mutmaßlichen Verstoßes, zu, wenn Sie der Ansicht sind, dass die Verarbeitung der Sie
                        betreffenden personenbezogenen Daten gegen die DSGVO verstößt.</p>
                    <p style="text-indent: 0pt;text-align: left;"><br/></p>
                    <p style="padding-left: 5pt;text-indent: 0pt;line-height: 114%;text-align: justify;">Die
                        Aufsichtsbehörde, bei der die Beschwerde eingereicht wurde, unterrichtet den Beschwerdeführer
                        über den Stand und die Ergebnisse der Beschwerde einschließlich der Möglichkeit eines
                        gerichtlichen Rechtsbehelfs nach Art. 78 DSGVO.</p>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="termsAccepted = !termsAccepted; showDialog = false"
                    >
                        I accept
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<style lang="less" scoped>
#tool-mobilityDataDraw-view-intro {
    > button {
        position: relative !important;
    }
    .intro-text {
        overflow-wrap: normal;
        max-width: 350px;
        padding-left: 5px;
    }
    .terms-holder {
        display: flex;
        div {
            margin-top: 22px;
            font-size: 11pt;
            padding-top: 8px;
        }
    }
}
</style>

<style lang="less">

.data-policy-text {
    max-height: 500px;
    overflow-y: auto;

    * {margin:0; padding:0; text-indent:0; }
    h1 { color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: bold; text-decoration: none; font-size: 14pt; }
    .s1 { color: black; font-family:Calibri, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; }
    h2 { color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: bold; text-decoration: none; font-size: 13pt; }
    .p, p { color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; margin:0pt; }
    .s2 { color: black; font-family:Arial, sans-serif; font-style: italic; font-weight: normal; text-decoration: none; font-size: 12pt; }
    a { color: black; font-family:Arial, sans-serif; font-style: italic; font-weight: normal; text-decoration: underline; font-size: 12pt; }
    h3 { color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: bold; text-decoration: none; font-size: 12pt; }
    .s3 { color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 11pt; }
    h4 { color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: bold; text-decoration: none; font-size: 11pt; }
    .s4 { color: black; font-family:"Times New Roman", serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; }
    .s5 { color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; }
    .s6 { color: #2F5496; font-family:Arial, sans-serif; font-style: italic; font-weight: normal; text-decoration: none; font-size: 12pt; }
    li {display: block; }
    #l1 {padding-left: 0pt;counter-reset: c1 1; }
    #l1> li>*:first-child:before {counter-increment: c1; content: counter(c1, upper-roman)". "; color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: bold; text-decoration: none; font-size: 13pt; }
    #l1> li:first-child>*:first-child:before {counter-increment: c1 0;  }
    #l2 {padding-left: 0pt;counter-reset: c2 1; }
    #l2> li>*:first-child:before {counter-increment: c2; content: counter(c2, decimal)". "; color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: bold; text-decoration: none; font-size: 12pt; }
    #l2> li:first-child>*:first-child:before {counter-increment: c2 0;  }
    #l3 {padding-left: 0pt; }
    #l3> li>*:first-child:before {content: " "; color: black; font-family:Symbol, serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 10pt; }
    #l4 {padding-left: 0pt; }
    #l4> li>*:first-child:before {content: " "; color: black; font-family:Symbol, serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 11pt; }
    #l5 {padding-left: 0pt; }
    #l5> li>*:first-child:before {content: " "; color: black; font-style: normal; font-weight: normal; text-decoration: none; }
    #l6 {padding-left: 0pt; }
    #l6> li>*:first-child:before {content: " "; color: black; font-style: normal; font-weight: normal; text-decoration: none; }
    #l7 {padding-left: 0pt; }
    #l7> li>*:first-child:before {content: " "; color: black; font-style: normal; font-weight: normal; text-decoration: none; }
    li {display: block; }
    #l8 {padding-left: 0pt;counter-reset: e1 4; }
    #l8> li>*:first-child:before {counter-increment: e1; content: counter(e1, decimal)". "; color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: bold; text-decoration: none; font-size: 12pt; }
    #l8> li:first-child>*:first-child:before {counter-increment: e1 0;  }
    #l9 {padding-left: 0pt;counter-reset: f1 1; }
    #l9> li>*:first-child:before {counter-increment: f1; content: "("counter(f1, decimal)") "; color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; }
    #l9> li:first-child>*:first-child:before {counter-increment: f1 0;  }
    #l10 {padding-left: 0pt;counter-reset: g1 1; }
    #l10> li>*:first-child:before {counter-increment: g1; content: "("counter(g1, decimal)") "; color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; }
    #l10> li:first-child>*:first-child:before {counter-increment: g1 0;  }
    #l11 {padding-left: 0pt;counter-reset: h1 1; }
    #l11> li>*:first-child:before {counter-increment: h1; content: counter(h1, lower-latin)") "; color: #2F5496; font-family:Arial, sans-serif; font-style: italic; font-weight: normal; text-decoration: none; font-size: 12pt; }
    #l11> li:first-child>*:first-child:before {counter-increment: h1 0;  }
    #l12 {padding-left: 0pt;counter-reset: i1 1; }
    #l12> li>*:first-child:before {counter-increment: i1; content: "("counter(i1, decimal)") "; color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; }
    #l12> li:first-child>*:first-child:before {counter-increment: i1 0;  }
    #l13 {padding-left: 0pt;counter-reset: j1 1; }
    #l13> li>*:first-child:before {counter-increment: j1; content: "("counter(j1, decimal)") "; color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; }
    #l13> li:first-child>*:first-child:before {counter-increment: j1 0;  }
    #l14 {padding-left: 0pt;counter-reset: k1 1; }
    #l14> li>*:first-child:before {counter-increment: k1; content: "("counter(k1, decimal)") "; color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; }
    #l14> li:first-child>*:first-child:before {counter-increment: k1 0;  }
    #l15 {padding-left: 0pt;counter-reset: l1 1; }
    #l15> li>*:first-child:before {counter-increment: l1; content: "("counter(l1, decimal)") "; color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; }
    #l15> li:first-child>*:first-child:before {counter-increment: l1 0;  }
}
</style>
