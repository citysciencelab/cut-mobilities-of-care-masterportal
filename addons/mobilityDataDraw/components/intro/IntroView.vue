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
                    Datenschutzerklärung „Storytelling & Data Collection Tool“
                    (Stand: 25.11.2021)
                    I. Name und Anschrift des Verantwortlichen
                    Der Verantwortliche im Sinne der Datenschutz-Grundverordnung und anderer
                    nationaler Datenschutzgesetze der Mitgliedsstaaten sowie sonstiger
                    datenschutzrechtlicher Bestimmungen ist die:
                    CityScienceLab
                    HafenCity Universität
                    Henning-Voscherau-Platz 1
                    20457 Hamburg
                    Michael Ziehl (michael.ziehl@hcu-hamburg.de)
                    Martin Niggemann (martin.niggemann@hcu-hamburg.de)
                    Tel.: +49 (0)40 4 28 27
                    II. Name und Anschrift des Datenschutzbeauftragten
                    Der Datenschutzbeauftragte des Verantwortlichen ist:
                    Christian Brettschneider (interimsweise)
                    Leitung HCU-IT Infrastruktur und Technik
                    Henning-Voscherau-Platz 1
                    20457 Hamburg
                    R. 5.003
                    Tel.: +49 (0)40 4 28 27- 4029 - 5250
                    christian.brettschneider@vw.hcu-hamburg.de
                    III. Allgemeines zur Datenverarbeitung
                    1. Umfang der Verarbeitung personenbezogener Daten
                    Wir verarbeiten lediglich die personenbeziehbaren Daten, die abgefragt und durch die
                    Nutzenden freiwillig eingegeben werden.
                    Jedem Mobilitätsdatensatz (s.o.) wird ein Steckbrief vorangestellt, der
                    folgende Informationen enthält:
                    • ID (1,2,3 / a,b,c)
                    • Alter in 10-jahres Kategorien (1-9; 10-19;,)
                    • Gender (m / w /d )
                    • Familienstand (LD, VH, VW, GS,..)
                    • Erwerbstätigkeit (auch nicht erwerbstätig als Option) (text)
                    • Haushalts-Einkommensklassen (Kategorien)
                    • Um wen kümmern Sie sich? [Personenklasse (Kind, Eltern, Bekannter, ...)
                    + Alter + im gleichen Haushalt?]
                    Zudem wird der jeweilige Zeitpunkt der Erfassung der Daten (Datum und
                    Uhrzeit) gespeichert.
                    Ein Mobilitätsdatensatz besteht aus:
                    • Wege auf einer Karte – Polylinie (Wege werden auf der Karte
                    eingezeichnet)
                    • Wegzeit für die zurückgelegte Strecke (wie lange?)
                    • Tageszeit zu der die Strecke zurückgelegt wurde (wann?)
                    • Genutztes Verkehrsmittel
                    • Kosten für die Verkehrsmittel
                    • Ggf. Begleitung
                    • Emotionen auf der Wegstrecke (z.B. via Smiley)
                    • Orte, die in einem direkten oder Indirekten Bezug zu der Wegstrecke
                    stehen.
                    • Stoppunkte (Punkte werden auf der Karte gesetzt)
                    • Aufenthaltsdauer an dem Stoppunkt
                    • Zeitpunkt des Stops
                    • Grund für den Stop
                    • Kommentare (Freitext oder als Sprachnachricht)
                    • Qualitative Information
                    • Annotationen
                    Darüber hinaus werden im Hintergrund grundsätzlich und ausschließlich nur Daten
                    erfasst und verarbeitet, die für die Bereitstellung und Funktionsfähigkeit der Website
                    notwendig sind.
                    2. Rechtsgrundlage für die Verarbeitung personenbezogener Daten
                    Das Projekt CUT, in das die Datenverarbeitung eingebettet ist, ist ein
                    Forschungsprojekt und das CityScienceLab der HCU ist neben anderen Hochschulen
                    Teil des Projektkonsortiums. Die Daten werden demensprechend ausschließlich zum
                    Zweck der Forschung erhoben und verarbeitet.
                    Forschungsaktivitäten werden laut §11 Hamburgisches Datenschutzgesetz (vor Mai
                    2018 war es §27 HmBDSG) als „Besondere Verarbeitungstätigkeiten“ bezeichnet und
                    legitimiert.
                    Darüber hinaus findet Art. 89 Abs. 1 DSGVO Anwendung (Daten, die zu
                    wissenschaftlichen oder historischen Forschungszwecken oder zu statistischen
                    Zwecken erhoben werden).
                    3. Datenlöschung und Speicherdauer
                    Die personenbezogenen Daten der betroffenen Person werden gelöscht oder
                    gesperrt, sobald der Zweck der Speicherung entfällt. Dies ist der Fall, wenn sie für die
                    Aufgabenerfüllung bzw. das Forschungsvorhaben nicht mehr erforderlich sind und
                    geschieht spätestens zum Ende der Projektlaufzeit (§75 Abs. 2 BDSG). Eine
                    Speicherung kann darüber hinaus erfolgen, wenn dies durch den europäischen oder
                    nationalen Gesetzgeber in unionsrechtlichen Verordnungen, Gesetzen oder sonstigen
                    Vorschriften, denen der Verantwortliche unterliegt, vorgesehen wurde. Eine Sperrung
                    oder Löschung der Daten erfolgt auch dann, wenn eine durch die genannten Normen
                    vorgeschriebene Speicherfrist abläuft, es sei denn, dass eine Erforderlichkeit zur
                    weiteren Speicherung der Daten für einen Vertragsabschluss oder eine
                    Vertragserfüllung besteht.
                    IV. Bereitstellung der Website und Erstellung von Logfiles
                    Beim Aufrufen der Website werden keine Logfiles erstellt und demnach werden auch
                    keine Informationen vom Computersystem des aufrufenden Rechners erhoben.
                    V. Verwendung von Cookies
                    Die Webseite verwendet keine Cookies.
                    VI. Verarbeitung von Daten zur Analyse des Surfverhaltens
                    Es findet keinerlei Analyse des Surfverhaltens statt.
                    VII. Rechte der betroffenen Person
                    Die folgende Auflistung umfasst alle Rechte der Betroffenen nach der DSGVO.
                    Rechte, die für die eigene Webseite keine Relevanz haben, müssen nicht genannt
                    werden. Insoweit kann die Auflistung gekürzt werden.
                    Werden personenbezogene Daten von Ihnen verarbeitet, sind Sie Betroffener i.S.d.
                    DSGVO und es stehen Ihnen folgende Rechte gegenüber dem Verantwortlichen zu:
                    4. Auskunftsrecht
                    Sie können von dem Verantwortlichen eine Bestätigung darüber verlangen, ob
                    personenbezogene Daten, die Sie betreffen, von uns verarbeitet werden.
                    Liegt eine solche Verarbeitung vor, können Sie von dem Verantwortlichen über
                    folgende Informationen Auskunft verlangen:
                    (1) die Zwecke, zu denen die personenbezogenen Daten verarbeitet werden;
                    (2) die Kategorien von personenbezogenen Daten, welche verarbeitet werden;
                    (3) die Empfänger bzw. die Kategorien von Empfängern, gegenüber denen die Sie
                    betreffenden personenbezogenen Daten offengelegt wurden oder noch
                    offengelegt werden;
                    (4) die geplante Dauer der Speicherung der Sie betreffenden personenbezogenen
                    Daten oder, falls konkrete Angaben hierzu nicht möglich sind, Kriterien für die
                    Festlegung der Speicherdauer;
                    (5) das Bestehen eines Rechts auf Berichtigung oder Löschung der Sie
                    betreffenden personenbezogenen Daten, eines Rechts auf Einschränkung der
                    Verarbeitung durch den Verantwortlichen oder eines Widerspruchsrechts gegen
                    diese Verarbeitung;
                    (6) das Bestehen eines Beschwerderechts bei einer Aufsichtsbehörde;
                    (7) alle verfügbaren Informationen über die Herkunft der Daten, wenn die
                    personenbezogenen Daten nicht bei der betroffenen Person erhoben werden;
                    (8) das Bestehen einer automatisierten Entscheidungsfindung einschließlich
                    Profiling gemäß Art. 22 Abs. 1 und 4 DSGVO und – zumindest in diesen Fällen
                    – aussagekräftige Informationen über die involvierte Logik sowie die Tragweite
                    und die angestrebten Auswirkungen einer derartigen Verarbeitung für die
                    betroffene Person.
                    Ihnen steht das Recht zu, Auskunft darüber zu verlangen, ob die Sie betreffenden
                    personenbezogenen Daten in ein Drittland oder an eine internationale Organisation
                    übermittelt werden. In diesem Zusammenhang können Sie verlangen, über die
                    geeigneten Garantien gem. Art. 46 DSGVO im Zusammenhang mit der Übermittlung
                    unterrichtet zu werden.
                    Dieses Auskunftsrecht kann insoweit beschränkt werden, als es voraussichtlich
                    die Verwirklichung der Forschungs- oder Statistikzwecke unmöglich macht oder
                    ernsthaft beeinträchtigt und die Beschränkung für die Erfüllung der Forschungsoder
                    Statistikzwecke notwendig ist.
                    5. Recht auf Berichtigung
                    Sie haben ein Recht auf Berichtigung und/oder Vervollständigung gegenüber dem
                    Verantwortlichen, sofern die verarbeiteten personenbezogenen Daten, die Sie
                    betreffen, unrichtig oder unvollständig sind. Der Verantwortliche hat die Berichtigung
                    unverzüglich vorzunehmen.
                    Ihr Recht auf Berichtigung kann insoweit beschränkt werden, als es
                    voraussichtlich die Verwirklichung der Forschungs- oder Statistikzwecke
                    unmöglich macht oder ernsthaft beeinträchtigt und die Beschränkung für die
                    Erfüllung der Forschungs- oder Statistikzwecke notwendig ist.
                    6. Recht auf Einschränkung der Verarbeitung
                    Unter den folgenden Voraussetzungen können Sie die Einschränkung der
                    Verarbeitung der Sie betreffenden personenbezogenen Daten verlangen:
                    (1) wenn Sie die Richtigkeit der Sie betreffenden personenbezogenen für eine
                    Dauer bestreiten, die es dem Verantwortlichen ermöglicht, die Richtigkeit der
                    personenbezogenen Daten zu überprüfen;
                    (2) die Verarbeitung unrechtmäßig ist und Sie die Löschung der
                    personenbezogenen Daten ablehnen und stattdessen die Einschränkung der
                    Nutzung der personenbezogenen Daten verlangen;
                    (3) der Verantwortliche die personenbezogenen Daten für die Zwecke der
                    Verarbeitung nicht länger benötigt, Sie diese jedoch zur Geltendmachung,
                    Ausübung oder Verteidigung von Rechtsansprüchen benötigen, oder
                    (4) wenn Sie Widerspruch gegen die Verarbeitung gemäß Art. 21 Abs. 1 DSGVO
                    eingelegt haben und noch nicht feststeht, ob die berechtigten Gründe des
                    Verantwortlichen gegenüber Ihren Gründen überwiegen.
                    Wurde die Verarbeitung der Sie betreffenden personenbezogenen Daten
                    eingeschränkt, dürfen diese Daten – von ihrer Speicherung abgesehen – nur mit Ihrer
                    Einwilligung oder zur Geltendmachung, Ausübung oder Verteidigung von
                    Rechtsansprüchen oder zum Schutz der Rechte einer anderen natürlichen oder
                    juristischen Person oder aus Gründen eines wichtigen öffentlichen Interesses der
                    Union oder eines Mitgliedstaats verarbeitet werden.
                    Wurde die Einschränkung der Verarbeitung nach den o.g. Voraussetzungen
                    eingeschränkt, werden Sie von dem Verantwortlichen unterrichtet bevor die
                    Einschränkung aufgehoben wird.
                    Ihr Recht auf Einschränkung der Verarbeitung kann insoweit beschränkt
                    werden, als es voraussichtlich die Verwirklichung der Forschungs- oder
                    Statistikzwecke unmöglich macht oder ernsthaft beeinträchtigt und die
                    Beschränkung für die Erfüllung der Forschungs- oder Statistikzwecke
                    notwendig ist.
                    7. Recht auf Löschung
                    a) Löschungspflicht
                    Sie können von dem Verantwortlichen verlangen, dass die Sie betreffenden
                    personenbezogenen Daten unverzüglich gelöscht werden, und der Verantwortliche ist
                    verpflichtet, diese Daten unverzüglich zu löschen, sofern einer der folgenden Gründe
                    zutrifft:
                    (1) Die Sie betreffenden personenbezogenen Daten sind für die Zwecke, für die sie
                    erhoben oder auf sonstige Weise verarbeitet wurden, nicht mehr notwendig.
                    (2) Sie widerrufen Ihre Einwilligung, auf die sich die Verarbeitung gem. Art. 6 Abs. 1
                    lit. a oder Art. 9 Abs. 2 lit. a DSGVO stützte, und es fehlt an einer anderweitigen
                    Rechtsgrundlage für die Verarbeitung.
                    (3) Sie legen gem. Art. 21 Abs. 1 DSGVO Widerspruch gegen die Verarbeitung ein
                    und es liegen keine vorrangigen berechtigten Gründe für die Verarbeitung vor,
                    oder Sie legen gem. Art. 21 Abs. 2 DSGVO Widerspruch gegen die
                    Verarbeitung ein.
                    (4) Die Sie betreffenden personenbezogenen Daten wurden unrechtmäßig
                    verarbeitet.
                    (5) Die Löschung der Sie betreffenden personenbezogenen Daten ist zur Erfüllung
                    einer rechtlichen Verpflichtung nach dem Unionsrecht oder dem Recht der
                    Mitgliedstaaten erforderlich, dem der Verantwortliche unterliegt.
                    (6) Die Sie betreffenden personenbezogenen Daten wurden in Bezug auf
                    angebotene Dienste der Informationsgesellschaft gemäß Art. 8 Abs. 1 DSGVO
                    erhoben.
                    b) Information an Dritte
                    Hat der Verantwortliche die Sie betreffenden personenbezogenen Daten öffentlich
                    gemacht und ist er gem. Art. 17 Abs. 1 DSGVO zu deren Löschung verpflichtet, so trifft
                    er unter Berücksichtigung der verfügbaren Technologie und der
                    Implementierungskosten angemessene Maßnahmen, auch technischer Art, um für die
                    Datenverarbeitung Verantwortliche, die die personenbezogenen Daten verarbeiten,
                    darüber zu informieren, dass Sie als betroffene Person von ihnen die Löschung aller
                    Links zu diesen personenbezogenen Daten oder von Kopien oder Replikationen dieser
                    personenbezogenen Daten verlangt haben.
                    c) Ausnahmen
                    Das Recht auf Löschung besteht nicht, soweit die Verarbeitung erforderlich ist
                    (1) zur Ausübung des Rechts auf freie Meinungsäußerung und Information;
                    (2) zur Erfüllung einer rechtlichen Verpflichtung, die die Verarbeitung nach dem
                    Recht der Union oder der Mitgliedstaaten, dem der Verantwortliche unterliegt,
                    erfordert, oder zur Wahrnehmung einer Aufgabe, die im öffentlichen Interesse
                    liegt oder in Ausübung öffentlicher Gewalt erfolgt, die dem Verantwortlichen
                    übertragen wurde;
                    (3) aus Gründen des öffentlichen Interesses im Bereich der öffentlichen
                    Gesundheit gemäß Art. 9 Abs. 2 lit. h und i sowie Art. 9 Abs. 3 DSGVO;
                    (4) für im öffentlichen Interesse liegende Archivzwecke, wissenschaftliche oder
                    historische Forschungszwecke oder für statistische Zwecke gem. Art. 89 Abs. 1
                    DSGVO, soweit das unter Abschnitt a) genannte Recht voraussichtlich die
                    Verwirklichung der Ziele dieser Verarbeitung unmöglich macht oder ernsthaft
                    beeinträchtigt, oder
                    (5) zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.
                    8. Recht auf Unterrichtung
                    Haben Sie das Recht auf Berichtigung, Löschung oder Einschränkung der
                    Verarbeitung gegenüber dem Verantwortlichen geltend gemacht, ist dieser
                    verpflichtet, allen Empfängern, denen die Sie betreffenden personenbezogenen Daten
                    offengelegt wurden, diese Berichtigung oder Löschung der Daten oder Einschränkung
                    der Verarbeitung mitzuteilen, es sei denn, dies erweist sich als unmöglich oder ist mit
                    einem unverhältnismäßigen Aufwand verbunden.
                    Ihnen steht gegenüber dem Verantwortlichen das Recht zu, über diese Empfänger
                    unterrichtet zu werden.
                    9. Recht auf Datenübertragbarkeit
                    Sie haben das Recht, die Sie betreffenden personenbezogenen Daten, die Sie dem
                    Verantwortlichen bereitgestellt haben, in einem strukturierten, gängigen und
                    maschinenlesbaren Format zu erhalten. Außerdem haben Sie das Recht diese Daten
                    einem anderen Verantwortlichen ohne Behinderung durch den Verantwortlichen, dem
                    die personenbezogenen Daten bereitgestellt wurden, zu übermitteln, sofern
                    (1) die Verarbeitung auf einer Einwilligung gem. Art. 6 Abs. 1 lit. a DSGVO oder
                    Art. 9 Abs. 2 lit. a DSGVO oder auf einem Vertrag gem. Art. 6 Abs. 1 lit. b
                    DSGVO beruht und
                    (2) die Verarbeitung mithilfe automatisierter Verfahren erfolgt.
                    In Ausübung dieses Rechts haben Sie ferner das Recht, zu erwirken, dass die Sie
                    betreffenden personenbezogenen Daten direkt von einem Verantwortlichen einem
                    anderen Verantwortlichen übermittelt werden, soweit dies technisch machbar ist.
                    Freiheiten und Rechte anderer Personen dürfen hierdurch nicht beeinträchtigt werden.
                    Das Recht auf Datenübertragbarkeit gilt nicht für eine Verarbeitung
                    personenbezogener Daten, die für die Wahrnehmung einer Aufgabe erforderlich ist,
                    die im öffentlichen Interesse liegt oder in Ausübung öffentlicher Gewalt erfolgt, die dem
                    Verantwortlichen übertragen wurde.
                    10. Widerspruchsrecht
                    Sie haben das Recht, aus Gründen, die sich aus ihrer besonderen Situation ergeben,
                    jederzeit gegen die Verarbeitung der Sie betreffenden personenbezogenen Daten, die
                    aufgrund von Art. 6 Abs. 1 lit. e oder f DSGVO erfolgt, Widerspruch einzulegen; dies
                    gilt auch für ein auf diese Bestimmungen gestütztes Profiling.
                    Der Verantwortliche verarbeitet die Sie betreffenden personenbezogenen Daten nicht
                    mehr, es sei denn, er kann zwingende schutzwürdige Gründe für die Verarbeitung
                    nachweisen, die Ihre Interessen, Rechte und Freiheiten überwiegen, oder die
                    Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von
                    Rechtsansprüchen.
                    Werden die Sie betreffenden personenbezogenen Daten verarbeitet, um
                    Direktwerbung zu betreiben, haben Sie das Recht, jederzeit Widerspruch gegen die
                    Verarbeitung der Sie betreffenden personenbezogenen Daten zum Zwecke derartiger
                    Werbung einzulegen; dies gilt auch für das Profiling, soweit es mit solcher
                    Direktwerbung in Verbindung steht.
                    Widersprechen Sie der Verarbeitung für Zwecke der Direktwerbung, so werden die Sie
                    betreffenden personenbezogenen Daten nicht mehr für diese Zwecke verarbeitet.
                    Sie haben die Möglichkeit, im Zusammenhang mit der Nutzung von Diensten der
                    Informationsgesellschaft – ungeachtet der Richtlinie 2002/58/EG – Ihr
                    Widerspruchsrecht mittels automatisierter Verfahren auszuüben, bei denen technische
                    Spezifikationen verwendet werden.
                    Sie haben auch das Recht, aus Gründen, die sich aus Ihrer besonderen
                    Situation ergeben, bei der Verarbeitung Sie betreffender personenbezogener
                    Daten, die zu wissenschaftlichen oder historischen Forschungszwecken oder
                    zu statistischen Zwecken gem. Art. 89 Abs. 1 DSGVO erfolgt, dieser zu
                    widersprechen.
                    Ihr Widerspruchsrecht kann insoweit beschränkt werden, als es voraussichtlich
                    die Verwirklichung der Forschungs- oder Statistikzwecke unmöglich macht oder
                    ernsthaft beeinträchtigt und die Beschränkung für die Erfüllung der Forschungsoder
                    Statistikzwecke notwendig ist.
                    11. Recht auf Widerruf der datenschutzrechtlichen Einwilligungserklärung
                    Sie haben das Recht, Ihre datenschutzrechtliche Einwilligungserklärung jederzeit zu
                    widerrufen. Durch den Widerruf der Einwilligung wird die Rechtmäßigkeit der aufgrund
                    der Einwilligung bis zum Widerruf erfolgten Verarbeitung nicht berührt.
                    12. Automatisierte Entscheidung im Einzelfall einschließlich Profiling
                    Sie haben das Recht, nicht einer ausschließlich auf einer automatisierten Verarbeitung
                    – einschließlich Profiling – beruhenden Entscheidung unterworfen zu werden, die
                    Ihnen gegenüber rechtliche Wirkung entfaltet oder Sie in ähnlicher Weise erheblich
                    beeinträchtigt. Dies gilt nicht, wenn die Entscheidung
                    (1) für den Abschluss oder die Erfüllung eines Vertrags zwischen Ihnen und dem
                    Verantwortlichen erforderlich ist,
                    (2) aufgrund von Rechtsvorschriften der Union oder der Mitgliedstaaten, denen der
                    Verantwortliche unterliegt, zulässig ist und diese Rechtsvorschriften
                    angemessene Maßnahmen zur Wahrung Ihrer Rechte und Freiheiten sowie
                    Ihrer berechtigten Interessen enthalten oder
                    (3) mit Ihrer ausdrücklichen Einwilligung erfolgt.
                    Allerdings dürfen diese Entscheidungen nicht auf besonderen Kategorien
                    personenbezogener Daten nach Art. 9 Abs. 1 DSGVO beruhen, sofern nicht Art. 9
                    Abs. 2 lit. a oder g DSGVO gilt und angemessene Maßnahmen zum Schutz der Rechte
                    und Freiheiten sowie Ihrer berechtigten Interessen getroffen wurden.
                    Hinsichtlich der in (1) und (3) genannten Fälle trifft der Verantwortliche angemessene
                    Maßnahmen, um die Rechte und Freiheiten sowie Ihre berechtigten Interessen zu
                    wahren, wozu mindestens das Recht auf Erwirkung des Eingreifens einer Person
                    seitens des Verantwortlichen, auf Darlegung des eigenen Standpunkts und auf
                    Anfechtung der Entscheidung gehört.
                    13. Recht auf Beschwerde bei einer Aufsichtsbehörde
                    Unbeschadet eines anderweitigen verwaltungsrechtlichen oder gerichtlichen
                    Rechtsbehelfs steht Ihnen das Recht auf Beschwerde bei einer Aufsichtsbehörde,
                    insbesondere in dem Mitgliedstaat ihres Aufenthaltsorts, ihres Arbeitsplatzes oder des
                    Orts des mutmaßlichen Verstoßes, zu, wenn Sie der Ansicht sind, dass die
                    Verarbeitung der Sie betreffenden personenbezogenen Daten gegen die DSGVO
                    verstößt.
                    Die Aufsichtsbehörde, bei der die Beschwerde eingereicht wurde, unterrichtet den
                    Beschwerdeführer über den Stand und die Ergebnisse der Beschwerde einschließlich
                    der Möglichkeit eines gerichtlichen Rechtsbehelfs nach Art. 78 DSGVO.
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
}
</style>
