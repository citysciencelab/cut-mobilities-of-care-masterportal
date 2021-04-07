# Code-Konventionen

## Einleitung
Als EntwicklerIn bist du natürlich stets motiviert, deinen Code nicht nur voll funktionstüchtig zu erstellen, sondern auch so nachhaltig wie möglich zu gestalten. Nachhaltigkeit umfasst eine Kombination aus Eigenschaften, welche auf den Prinzipien des "Clean Code" basieren und auch auf deinen Code zutreffen werden. Um möglichst objektiv entscheiden zu können, ob dein Code im ersten Anlauf die Hürde des Pull-Requests meistert, haben wir einen Linter sowie einige Konventionen definiert. Bei dem Linter handelt es sich um **[ESLint](https://eslint.org/)**. Die Konfigurationsdatei **[.eslintrc](../.eslintrc)** ist im Repository. Bei jedem Push werden automatisch Linter sowie Unittests ausgeführt. Beim Auftreten eines Fehlers wird ein Push verhindert. Die Konventionen sind in zwei Teile unterteilt. Ein Verstoß gegen eine Konvention aus Teil A führt zum Decline des Pull Requests. In Teil B sind Leitlinien formuliert, durch deren Einhaltung das Nachnutzen und Warten des Codes verbessert wird. Es wäre wünschenswert, wenn diese Leitlinien beachtet werden, sie sind aber nicht zwingend einzuhalten.

## Konventionen

### Teil A
Folgende Punkte müssen alle mit Ja beantwortet werden können:

#### A.1 Linter und Funktionalität
A.1.1 Der Code funktioniert im Internet Exporer 11+, Chrome und Firefox.
A.1.2 Der Code funktioniert in der mobilen Ansicht der jeweiligen Browser aus A.1.1.
A.1.3 Der Linter ist nicht deaktiviert.
A.1.4 Der Linter wirft keinen Fehler.
A.1.5 Dateien sind im Encoding "UTF-8".
A.1.6 Backbone: In Templates werden keine Pfeil-Funktionen genutzt.

---

#### A.2 Packages und Libraries
A.2.1 Der Code nutzt die von *Geowerkstatt* eingesetzten Frameworks und Libraries und umgeht diese nicht.
A.2.2 Es wird kein *Underscore.js* benutzt, außer für den Aufruf _.template().
A.2.3 Es werden keine redundanten Packages eingebunden.
A.2.4 JQuery wird nur noch im Zusammenhang mit Backbone.js verwendet.
A.2.5 Das Hinzufügen großer Packages/Libraries ist mit dem Team *LGV* abgesprochen.

---

#### A.3 Code
A.3.1 Neue Dateien wurden gemäß der vorhandenen Struktur angelegt.
A.3.2 Variablen, Funktionen, Ordner, Dateien haben sprechende englische Namen.
A.3.3 Kommentare sind in englischer Sprache verfasst.
A.3.4 Block-Kommentare von Funktionen beschreiben stets deren Zweck.
A.3.5 Styles sind im .less Format verfasst.
A.3.6 Es wird kein !important in Styles benutzt.
A.3.7 Module und Komponenten beeinflussen lediglich das Verhalten und die Styles ihrer eigenen (Kind-) Elemente.
A.3.8 Es werden keine Styles mit JavaScript verändert.
A.3.9 Alle Styles haben eine modulabhängige ID als Präfix oder sind im "scoped" Modus verfasst.
A.3.10 Es gibt keine Inline-Styles.

---

#### A.4 Dokumentation im Code (JS-Doc)
A.4.1 Die Dokumentationssprache ist Englisch.
A.4.2 Das Erstellen der Dokumentation mit npm run buildJsDoc wirft keine Fehler.
A.4.3 Backbone: Jede Funktion hat einen JSDoc-Block mit Beschreibung, Übergabeparametern, Rückgabewert und ggf. Events.
A.4.4 Backbone: Die Klassendefinition befindet sich über initialize() mit Angabe der Default-Werte. Alle Event-Listener, -Trigger und -Requests, die in der Klasse vorkommen, sind ebenfalls in der Klassendefinition dokumentiert.
A.4.5 Backbone: Wird von einer Klasse geerbt, existiert ein *lend* Kommentar.
A.4.6 Backbone: Namespaces wurden in der Datei **[namespaces.js](../devtools/jsdoc/namespaces.js)** definiert. Sie repräsentieren die Ordnerstruktur/Module des Codes.
A.4.7 Backbone: Events sind in der Datei **[events.js](../devtools/jsdoc/events.js)** definiert.

---

#### A.5 Unit-Tests
A.5.1 Zu jeder unittestbaren Funktion existieren Unit-Tests.
A.5.2 Jedes Model hat eine Test-Datei, die mit **.test.js** (Backbone) oder **.spec.js** (Vue) endet und unter **[test/unittests/modules](../test/unittests/modules)** in der selben Ordnerstruktur wie der Code abgelegt wurde.
A.5.3 Jede Funktion hat mindestens einen Positiv-Test (Funktionsaufruf mit plausiblen Werten) und einen Negativ-Test (Funktionsaufruf mit unplausiblen Werten, z.B. *undefined*, *[]*, *{}*, *""*, ...).

---

#### A.6 Abwärts-Kompatibilität und Konfigurierbarkeit
A.6.1 Es gibt keine hartcodierten URL's und Pfade zu externen Quellen.
A.6.2 Konfigurierbare Parameter sind in den .md Dateien dokumentiert.
A.6.3 Alle bisherigen Konfigurationsparameter sind weiterhin verwendbar.
A.6.4 Parameter die umbenannt oder gelöscht werden sollen, sind als ```Deprecated``` markiert.

---

#### A.7 Mehrsprachigkeit
A.7.1 In allen relevanten Dateien ist die Mehrsprachigkeit erweitert oder hinzugefügt.
A.7.2 Sprachdateien sind in mindestens Englisch und Deutsch gepflegt.
A.7.3 Die Fallback-Sprache ist Deutsch.
A.7.4 Die Dokumentation (z.B. languages_de.md und languages_en.md) ist auf Englisch, Deutsch und der entsprechenden Sprache gepflegt.

---

#### A.8 Changelog
A.8.1 Die Sprache für Einträge im Changelog ist Englisch.
A.8.2 Das Löschen oder Hinzufügen eines Features sowie Bugfixes sind im Changelog zu erfassen.
A.8.3 Änderungen, welche das UI, Schnittstellen oder Konfigurationen ändern, sind im Changelog erfasst.
A.8.4 Einträge sind einer der folgenden Kategorien zugeordnet: Added, Changed, Deprecated, Removed, Fixed.
A.8.5 Einträge sollen in einer einfachen Sprache geschrieben werden (kein Fachjargon). Der Changelog soll den Anwender und Entwickler informieren.

---

#### A.9 Dateistruktur
A.9.1 Die Dateistruktur für neue Module soll nach folgenden Schema angelegt werden:

```bash
src
|--app-store
|   |-- utils
|   |-- actions.js
|   |-- getters.js
|   |-- index.js
|   |-- mutations.js
|   |-- state.js
|   |-- test
|
|-- modules
|   |-- exampleModule
|   |   |-- components
|   |   |   |-- ExampleModule.vue
|   |   |   |-- ...
|   |   |-- store
|   |   |   |-- actionsExampleModule.js
|   |   |   |-- constantsExampleModule.js
|   |   |   |-- gettersExampleModule.js
|   |   |   |-- indexExampleModule.js
|   |   |   |-- mutationsExampleModule.js
|   |   |   |-- stateExampleModule.js
|   |   |
|   |   |-- tests
|   |   |   |-- unit
|   |   |   |   |-- components
|   |   |   |   |   |-- exampleModule.spec.js
|   |   |   |   |-- store
|   |   |   |   |   |-- actionsExampleModule.spec.js
|   |   |   |   |   |-- gettersExampleModule.spec.js
|   |   |   |   |   |-- mutationsExampleModule.spec.js
|   |   |   |-- end2end	(Modul spezifisch)
|   |   |   |   |-- ExampleModule.e2e.js
|   |
|   |-- controls
|   |   |-- ControlBar.vue
|   |   |-- ControlIcon.vue
|   |   |-- gettersControls.js
|   |   |-- indexControls.js
|   |   |-- mutationsControls.js
|   |   |-- ...
|   |   |-- exampleControl
|   |   |   |-- components
|   |   |   |-- store
|   |   |   |-- test
|   |
|   |-- tools
|   |   |-- actionsTool.js
|   |   |-- indexTools.js
|   |   |-- Tool.vue
|   |   |-- exampleTool
|   |   |   |-- components
|   |   |   |-- store
|   |   |   |-- test
|   |
|-- share-components
|   |-- exampleShareComponent.vue
|
|-- test
|   |--end2end
|   |   |--exampleGlobalTest.e2e.js
|
|-- utils
|   |-- exampleGlobalFunction.js
|
|-- addons.js
|-- App.vue
|-- MainNav.vue
|-- MapRegion.vue
```

---

---

### Teil B (optional)
Der Code ist so lesbar und verständlich wie möglich geschrieben. Das Ziel ist nicht, Zeilen zu sparen, sondern die Zeit der nachfolgenden EntwicklerInnen.

#### B.1 Struktur
B.1.1 Markup (Templates), Styles (CSS) und Logik (Controller) sind sauber voneinander getrennt.
B.1.2 Im Controller wird kein HTML erzeugt.
B.1.3 Der Code hat keine Redundanzen. ([No duplicated code / DRY](https://de.wikipedia.org/wiki/Don%E2%80%99t_repeat_yourself))
B.1.4 Funktionen, welche eine allgemeine, globale Verwendbarkeit aufweisen, sind in eine Helper Datei ausgelagert.
B.1.5 Jede Funktion erledigt nur *eine* und klar definierte Aufgabe. ([Curly's Law](https://de.wikipedia.org/wiki/Single-Responsibility-Prinzip))
B.1.6 Selbstdefinierte Funktionen verändern Werte nie per Referenz, sondern geben stets den ermittelten Wert zurück.
B.1.7 In Templates befindet sich keine Datenverändernde Logik und Geschäftslogik.
B.1.8 Vue: Datenpersistierung und Kommunikation erfolgt per VueX Store.

---

#### B.2 Lesbarkeit und Nachvollziehbarkeit
B.2.1 Der Code wurde so einfach wie möglich geschrieben. ([KISS](https://de.wikipedia.org/wiki/KISS-Prinzip))
B.2.2 Im Code werden wenn möglich Pfeil-Funktionen genutzt. Es gibt kein unnötiges Mitschleifen des This-Contextes.
B.2.3 Funktionsparameter und Properties haben wenn möglich definierte Standardwerte.
B.2.4 Es werden native Ecma-Script Funktionen und Objekte genutzt.
B.2.5 Die Typprüfung erfolgt mit typeof, instanceof und Array.isArray() sowie "===".

---

#### B.3 Vue Best Practice
B.3.1 Vue-Komponenten im share-components Verzeichnis werden nach den Regeln von [Vue-Styleguidist](https://vue-styleguidist.github.io/) kommentiert.
B.3.2 Backbone Radio - Neue Vue-Module sollen soweit möglich ohne Radio auskommen. Radio-Events können in alten Modulen durch den Store ersetzt werden.
B.3.3 Für Requests wird empfohlen die Biblothek Axios zu verwenden.

---

#### B.4 Vue Best Practice - State-Management
B.4.1 Um aus dem State einfache getters und mutations zu schreiben, nutze die Funktionen aus der generator.js (./src/app-store/utils).
B.4.2 Nutze die Helper-Funktionen von vuex um die Daten aus dem Store einfacher in die Komponente einzubinden.

---

#### B.5 Vue Best Practice - Style
B.5.1 Nutze wann immer möglich scoped im Style-Tag.
B.5.2 Vermeide die Nutzung von !important.
B.5.3 Verwende möglichst keine absoluten width und height Angaben (sehr schlecht für Responsive Design).
B.5.4 Es gibt eine globale less-Datei (variables.less), die alle benötigten BootstrapV3 und im Masterportal vorhandene Variablen beinhaltet. Alle für das Theming benötigten Variablen(Schriftarten, Farben, ...) werden hier gepflegt. Die Datei variables.less darf nur Variablen, Mixins, und Funktionen beinhalten. CSS-Regeln führen dazu, dass diese pro Import wiederholt werden. Über den import-Befehl im style-Tag wird die variables.less in die Komponente eingebunden.

---

#### B.6 Ausgabe von Fehlermeldungen
B.6.1 Verwende das Alerting-Modul.
B.6.2 Gib eine sprechende Fehlermeldung, die der NutzerIn erklärt was schiefgelaufen ist. Nutze dabei die Mehrsprachigkeit.
B.6.3 Fehler nur dann auswerfen, wenn sie relevant für die NutzerIn sind und sich auf den aktuellen Arbeitsschritt beziehen.
B.6.4 Wenn der NutzerIn ein Fehler mitgeteilt wird, sagen dass etwas schiefgelaufen ist, warum etwas schiefgelaufen ist und was die NutzerIn tun kann, um den Fehler zu beheben! Wenn nichts getan werden kann überlegen, ob der Fehler der NutzerIn mitgeteilt werden muss.
B.6.5 Gib technische Fehlermeldung (für die EntwicklerIn) als console.error() oder console.warn() in englischer Sprache aus.

---
