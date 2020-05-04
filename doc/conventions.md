*Motivation:*

Sehe dich als Autor eines Buches. Was du schreibst, soll jemand anderes auch wieder lesen und verstehen können. Wie beim Bücher schreiben solltest du auch bestimmte Regeln einhalten...wer druckt schon ein Buch mit gelber Schrift auf weißem Papier?
***
Konventionen für das Master-Portal

1. Schreibe **[Clean Code](conventions/cleanCode.md)**.
2. Verwende native **[ES6-Funktionalitäten](conventions/es6Functions.md)**.
3. Beachte das **[MV*](https://www.infragistics.com/community/blogs/b/nanil/posts/exploring-javascript-mv-frameworks-part-1-hello-backbonejs)**-Muster von **[Backbone](conventions/backbone.md)**.
4. Beachte den **[Linter](conventions/linter.md)**.
5. Schreibe **[testbare Funktionen](conventions/unitTests.md)** und die entsprechenden **[UnitTests](conventions/unitTests.md)** dazu.
6. Schreibe valides **[JSDoc](conventions/jsdoc.md)**.
7. Verwende **[sprechende Fehlermeldungen](conventions/errorMessages.md)**.
8. Schreibe **[konfigurierbaren](conventions/configuration.md)** Code und erweitere die Dokumentation für das Masterportal.
9. Beachte die **[Abwärts-Kompatibilität](conventions/backwardsCompatibility.md)** der Konfigurationsdateien.
10. Pre-push Hooks **[Pre-push Hooks](conventions/pre-push_hooks.md)**
11. Erweitere die **[Mehrsprachigkeit](conventions/i18n.md)**

***

## Vue Konventionen

### Allgemein
* Vue wird mit Single File Components umgesetzt
* Less wird als Stylesprache verwendet
* Style-Tag ist immer scoped

### ESLint
Für den Linter wird folgendes Plugin verwendet:
[eslint-plugin-vue 6.x.x](https://eslint.vuejs.org/)

Das Plugin unterteilt die Regeln in fünf Kategorien (Base, Essential, Strongly Recommended, Recommended, Uncategorizied).
Standardmäßig melden alle Regeln aus der Base und Essential Kategorie Fehler.
Die Regeln aus den anderen Kategorien (Strongly Recommended, Recommended, Uncategorizied) melden Warnungen.

Damit alle genutzten Regeln Fehler werfen, ist das Plugin mit der Kategorie Essential (beinhaltet auch die Regeln von Base) eingebunden und die Regeln aus den Kategorien Strongly Recommended, Recommended und Uncategorizied entsprechend überschrieben.

#### Konfiguration .eslintrc
```
"extends": [
    ...
    "plugin:vue/essential"
]
"rules": {
    // Priority B: Strongly Recommended
    "vue/attribute-hyphenation": ["error", "always"],
    ...
    // Priority C: Recommended
    "vue/this-in-template": ["error", "never"],
    ...
    // Uncategorizied
    "vue/array-bracket-spacing": ["error"],
    ...
}
```

### Backbone Radio
Neue Vue-Module sollen soweit möglich ohne Radio auskommen. Radio-Events sollen in alten Modulen durch den Store ersetzt werden.

### State-Management
Vuex wird für die Verwaltung der Daten und deren Verarbeitung genutzt.
Der Store wird modularisiert aufgebaut. Die Store-Dateien sind unterteilt in getters, mutations, actions und index.
Der State der Anwendung (configJSON, configJS, isMobile,...) liegt im app-store Verzeichnis (./src/app-store).
Komponentenspezifischer State wird in den jeweiligen Modulen abgelegt und nach dem Modul benannt (siehe Dateistruktur).
Daten die nur innerhalb des Modules benötigt werden, sind in der entsprechenden Vue-Komponente im _data-Attribut_ zu pflegen und nicht im Store.

Von AddOns abgesehen werden Module direkt im app Store (./src/app-store/index.js) eingetragen.

### Code Kommentare
Vue-Komponenten werden nach den Regeln von [Vue-Styleguidist](https://vue-styleguidist.github.io/) kommentiert.
JS-Dateien werden weiterhin mit JSDoc beschrieben.

### Dateistruktur / Namenkonvention der Dateien
``` bash
src
|-- modules
|   |-- scaleLine
|   |   |-- components
|   |	  |   |-- ScaleLine.vue
|   |   |   |-- ...
|   |	  |-- store
|   |   |   |-- actionsScaleLine.js
|   |   |   |-- gettersScaleLine.js
|   |   |   |-- indexScaleLine.js
|   |   |   |-- mutationsScaleLine.js
|   |   |   |-- stateScaleLine.js
|   |   |
|   |	  |-- test
|   |	  |   |-- unit
|   |	  |   |-- end2end	(Modul spezifisch)
|   |
|   |-- controls
|   |   |-- Controls.vue
|   |   |-- indexControls.js
|   |   |-- stateControls.js
|   |   |-- ...
|   |   |-- attribution
|   |	  |   |-- components
|   |	  |   |-- store
|   |	  |   |-- test
|   |   |-- zoom
|   |	  |   |-- components
|   |	  |   |-- store
|   |	  |   |-- test
|   |-- map
|   |   |-- store
|   |   |-- test
|   |
|   |-- test
|   |	  |-- end2end		(Events mehrerer Module)
|
|-- share-components
|   |-- buttons
|   |   |-- submitButton.vue
|   |   |-- closeButton.vue
|   |-- charts
|   |   |-- barChart.vue
|   |-- modals
|
|-- app-store
|   |-- actions.js
|   |-- getters.js
|   |-- index.js
|   |-- mutations.js
|   |-- state.js
|   |-- utils/helper functions??
|
|-- utils
|   |-- ...
|
|-- variables.less
|-- App.vue
```

### Style
Es gibt eine globale less-Datei (variables.less), die alle benötigten BootstrapV3 und im Masterportal vorhandene Variablen beinhaltet.
Alle für das Theming benötigten Variablen(Schriftarten, Farben, ...) werden hier gepflegt.
Die Datei variables.less darf nur Variablen, Mixins, und Funktionen beinhalten. CSS-Regeln führen dazu, dass diese pro Import wiederholt werden.
Über den import-Befehl im style-Tag wird die variables.less in die Komponente eingebunden.
```
<style lang="less" scoped>
    @import "~variables";
</style>
```
* kein !important nutzen
* möglichst keine absolute width und height Angaben nutzen (sehr schlecht für Responsive Design)

