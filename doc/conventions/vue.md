## Vue Konventionen

Die Konventionen befinden sich aktuell noch in der Bearbeitung

#### Allgemein
Die Umsetzung von Vue erfolgt durch Single File Components und als Stylesprache wird Less eingesetzt.

#### ESLint
Für Vue Components wird folgendes ESLint Plugin verwendet:
[eslint-plugin-vue 6.x.x](https://eslint.vuejs.org/)
Die Linter-Regeln müssen beachtet werden. Die Konfiguration der Regeln stehen in der der **[.eslintrc](../.eslintrc)**.

#### State-Management
Vuex wird für die Verwaltung der Daten und deren Verarbeitung genutzt.
Der Store wird modularisiert aufgebaut. Die Store-Dateien sind unterteilt (soweit benötigt) in getters, mutations, actions, state und index.
Der State der Anwendung (configJSON, configJS, isMobile,...) liegt im app-store Verzeichnis (./src/app-store).
Komponentenspezifischer State wird in den jeweiligen Modulen abgelegt und nach dem Modul benannt (siehe Dateistruktur).
Daten die nur innerhalb des Modules benötigt werden, sind in der entsprechenden Vue-Komponente im _data-Attribut_ zu pflegen und nicht im Store.
Von AddOns abgesehen wird der Store der Module direkt im app Store (./src/app-store/index.js) eingebunden.


#### Dateistruktur / Namenkonvention der Dateien
``` bash
src
|-- modules
|   |-- scaleLine
|   |   |-- components
|   |	|   |-- ScaleLine.vue
|   |   |   |-- ...
|   |	|-- store
|   |   |   |-- actionsScaleLine.js
|   |   |   |-- constantsScaleLine.js
|   |   |   |-- gettersScaleLine.js
|   |   |   |-- indexScaleLine.js
|   |   |   |-- mutationsScaleLine.js
|   |   |   |-- stateScaleLine.js
|   |   |
|   |	|-- test
|   |	|   |-- unit
|   |	|   |-- end2end	(Modul spezifisch)
|   |
|   |-- controls
|   |   |-- Controls.vue
|   |   |-- indexControls.js
|   |   |-- stateControls.js
|   |   |-- ...
|   |   |-- attribution
|   |	|   |-- components
|   |	|   |-- store
|   |	|   |-- test
|   |   |-- zoom
|   |	|   |-- components
|   |	|   |-- store
|   |	|   |-- test
|   |-- map
|   |   |-- store
|   |   |-- test
|   |
|   |-- test
|   |	|-- end2end
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

#### Code Kommentare
Vue-Komponenten im share-components Verzeichnis werden nach den Regeln von [Vue-Styleguidist](https://vue-styleguidist.github.io/) kommentiert.

#### Style
Es gibt eine globale less-Datei (variables.less), die alle benötigten BootstrapV3 und im Masterportal vorhandene Variablen beinhaltet.
Alle für das Theming benötigten Variablen(Schriftarten, Farben, ...) werden hier gepflegt.
Die Datei variables.less darf nur Variablen, Mixins, und Funktionen beinhalten. CSS-Regeln führen dazu, dass diese pro Import wiederholt werden.
Über den import-Befehl im style-Tag wird die variables.less in die Komponente eingebunden.
```
<style lang="less" scoped>
    @import "~variables";
</style>
```

## Vue Best Practice

#### State-Management

Um aus dem State einfache getters und mutations zu schreiben, nutze die Funktionen aus der generator.js (./src/app-store/ut.ils)
```
import state from "./state";
import {generateSimpleMutations} from "~generators";

const mutations = {
    ...generateSimpleMutations(state),
```

Nutze die Helper-Funktionen von vuex um die Daten aus dem Store einfacher in die Komponente einzubinden.
* [mapState](https://vuex.vuejs.org/guide/state.html#the-mapstate-helper)
* [mapGetters](https://vuex.vuejs.org/guide/getters.html#the-mapgetters-helper)
* [mapMutations](https://vuex.vuejs.org/guide/mutations.html#committing-mutations-in-components)
* [mapActions](https://vuex.vuejs.org/guide/actions.html#dispatching-actions-in-components)

#### Style

* Nutze wann immer möglich scoped im Style-Tag
* Vermeide die Nutzung von !important
* Verwende möglichst keine absoluten width und height Angaben (sehr schlecht für Responsive Design)

#### Backbone Radio
Neue Vue-Module sollen soweit möglich ohne Radio auskommen. Radio-Events können in alten Modulen durch den Store ersetzt werden.
