
## Tutorial: Ein neues Tool in Vue erstellen (Scale-Switcher)
Eine Schritt für Schritt Anleitung zur Erstellung eines neuen Tools mit [vue](https://vuejs.org/) und [vuex](https://vuex.vuejs.org/).

### Beispiel Anforderung
Wir wollen ein Tool schreiben, über welches man den Kartenmaßstab steuern kann. Dabei soll über ein Drop-Down-Menü der Maßstab ausgewählt werden. Sobald der Maßstab gesetzt wurde, soll sich die Karte anpassen.
Darüber hinaus soll unser Tool auf Änderungen des Kartenmaßstabes reagieren und den entsprechend aktuellen Maßstab im Drop-Down-Menu anzeigen.

### Neues Tool anlegen
In das Verzeichnis "src/modules/tools" wechseln und einen neuen Ordner erstellen. Aus dem Ordnernamen soll ersichtlich sein, um was für ein Tool es sich dabei handelt - z.B. "scaleSwitcher". Darunter  die Ordner "components" und "store" anlegen und darin die für dieses Tool benötigten Dateien anlegen. Ebenso die Dateien für die Tests anlegen. Das [Tutorial für vue-Tests](unitTestVue.de.md) beschreibt, wie der ScaleSwitcher getestet werden kann.
```
src
|-- modules
|   |-- tools
|   |   |-- scaleSwitcher
|   |   |   |-- components
|   |   |	|   |-- ScaleSwitcher.vue
|   |   |   |   |-- ...
|   |   |	|-- store
|   |   |   |   |-- actionsScaleSwitcher.js
|   |   |   |   |-- constantsScaleSwitcher.js (wird hier nicht benötigt)
|   |   |   |   |-- gettersScaleSwitcher.js
|   |   |   |   |-- indexScaleSwitcher.js
|   |   |   |   |-- mutationsScaleSwitcher.js
|   |   |   |   |-- stateScaleSwitcher.js
|   |   |   |
|   |   |	|-- test
|   |   |	|   |-- end2end
|   |   |   |	|   |-- ScaleSwitcher.e2e.js
|   |   |	|   |-- unit
|   |   |   |	|   |-- components
|   |   |   |   |	|   |-- ScaleSwitcher.spec.js
|   |   |   |	|   |-- store
|   |   |   |   |	|   |-- actionsScaleSwitcher.spec.js
|   |   |   |   |	|   |-- gettersScaleSwitcher.spec.js
```

### ScaleSwitcher.vue erstellen
Datei *modules/tools/scaleSwitcher/components/ScaleSwitcher.vue* öffnen und die Vue-Komponente als [Single File Component](https://vuejs.org/v2/guide/single-file-components.html) erzeugen. Ihr wird die Tool-Komponente zur Verfügung gestellt. Sie beinhaltet das Verhalten und Rendern des Fensters oder der Sidebar in der das Tool "ScaleSwitcher" angezeigt wird.
```vue
import Tool from "../../Tool.vue";

<script>
export default {
    name: "ScaleSwitcher",
    components: {
        Tool
    }
};
</script>

<template lang="html">
</template>

<style lang="less">
</style>

```

### ScaleSwitcher-Komponente registrieren
In die Datei *src/modules/tools/stateTools.js* wechseln, ScaleSwitcher importieren und als Komponente in der componentMap hinzufügen. Der ToolManager (src/modules/tools/ToolManager.vue) initialisiert die ScaleSwitcher-Komponente und lädt die Konfiguration des ScaleSwitchers aus der Konfigurationsdatei config.json und stellt diese im state zur Verfügung. Die Konfiguration wird unter den Pfaden "configJson.Portalconfig.menu.scaleSwitcher" und "configJson.Portalconfig.menu.tools.children.scaleSwitcher" in der config.json gesucht. Siehe auch [Dokumentation config.json](config.json.de.md). Die ToolManager.vue ist im Template-Bereich der MapRegion registriert. Sie wird nur erzeugt, wenn die [*v-if* Direktive](https://vuejs.org/v2/api/#v-if) "configJson" im state vorhanden ist.
```js
import ScaleSwitcher from "./scaleSwitcher/components/ScaleSwitcher.vue";
... // import further Tools

/**
 * User type definition
 * @typedef {object} ToolsState
 * @property {object} componentMap contains all tool components
 * @property {object[]} configuredTools gets all tools that should be initialized
 */
const state = {
    componentMap: {
        scaleSwitcher: ScaleSwitcher
        ... // further Tools
    },
    configuredTools: []
};

export default state;
```
### state definieren
Den [Vuex state](https://vuex.vuejs.org/guide/state.html) in der Datei *modules/tools/scale/store/stateScaleSwitcher.js* festlegen.
```js
const state = {
    // mandatory
    active: false,
    id: "scaleSwitcher",
    // mandatory defaults for config.json parameters
    name: "common:menu.tools.coord",
    glyphicon: "glyphicon-resize-full",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false
};

export default state;

```
### getters definieren
[Vuex getters](https://vuex.vuejs.org/guide/getters.html#getters) in der Datei *modules/tools/scaleSwitcher/store/gettersScaleSwitcher.js* festlegen. Um aus dem state einfache getter zu erzeugen wird die Funktion *generateSimpleGetters* genutzt.
```js
import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import scaleSwitcherState from "./stateScaleSwitcher";

const getters = {
    /**
     * Returns an object of simple getters for a state object, where
     * simple means that they will just return an entry for any key.
     * For example, given a state object {key: value}, an object
     * {key: state => state[key]} will be returned.
     * This is useful to avoid writing basic operations.
     * @param {object} state state to generate getters for
     * @returns {object.<string, function>} object of getters
     */
    ...generateSimpleGetters(scaleSwitcherState)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;

```
### mutations definieren, die den state verändern
[Vuex mutations](https://vuex.vuejs.org/guide/mutations.html#mutations) in der Datei *modules/tools/scaleSwitcher/store/mutationsScaleSwitcher.js* festlegen. Um aus dem state einfache mutations zu erzeugen wird die Funktion *generateSimpleMutations* genutzt.
```js
import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import state from "./stateScaleSwitcher";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(state)

     // NOTE overwrite mutations here if you need a special behaviour in a mutation
};

export default mutations;

```
### actions definieren
[Vuex actions](https://vuex.vuejs.org/guide/actions.html#actions) können in einer datei *modules/tools/scaleSwitcher/store/actionsScaleSwitcher.js* festgelegt werden. Beim ScaleSwitcher werden keine Actions verwendet. activateByUrlParam und setToolActiveByConfig werden global über den ToolManager gesteuert.

- "activateByUrlParam" prüft ob die Url den Parameter "isinitopen" für ein Tool enthält und aktiviert dieses gegebenenfalls. Siehe auch [Dokumentation Url-Parameter](urlParameter.de.md).
- die action "setToolActiveByConfig" setzt den state "active" eines Tools auf true, dann wird das Tool gerendert (siehe property active am Tool.vue).
```js
const actions = {
    // NOTE write actions here if you need them
};

export default actions;
```
### store/index-Datei füllen
In die Datei *src/modules/tools/scaleSwitcher/store/indexScaleSwitcher.js* wechseln. Dort den state, die getters, mutations und actions importieren und als default exportieren.
```js
import mutations from "./mutationsScaleSwitcher";
import actions from "./actionsScaleSwitcher";
import getters from "./gettersScaleSwitcher";
import state from "./stateScaleSwitcher";

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
```
### state, getter, mutations und actions dem vuex store bekannt geben
In die Datei *src/modules/tools/indexTools.js* wechseln, die Datei *src/modules/tools/scaleSwitcher/store/indexScaleSwitcher.js* importieren und und dem vuex store als *module* hinzufügen.
```js
import state from "./stateTools";
import getters from "./gettersTools";
import mutations from "./mutationsTools";
import actions from "./actionsTools";
import ScaleSwitcher from "./scale/store/indexScaleSwitcher";
... // import further Tools

export default {
    namespaced: true,
    modules: {
        ScaleSwitcher
        ... // further Tools
    },
    state,
    getters,
    mutations,
    actions
};
```
### getters in der ScaleSwitcher.vue als computed properties bereitstellen
In der Datei *modules/tools/scaleSwitcher/components/ScaleSwitcher.vue* "mapGetters" aus vuex und die getters des ScaleSwitchers importieren. Alle getter-keys des ScaleSwitchers und die getter *scale* und *scales* aus der Map bereitstellen. Für *scale* wird zusätzlich ein setter bereitgestellt. Mit *scale* kann der aktuelle Maßstab der Karte (Map) und über *scales* alle verfügbaren Maßstäbe der Karte abgefragt werden.
```js
import Tool from "../../Tool.vue";
import {mapGetters} from "vuex";
import getters from "../store/gettersScaleSwitcher";
...
computed: {
        ...mapGetters("Tools/ScaleSwitcher", Object.keys(getters)),
        ...mapGetters("Map", ["scales"]),
         scale: {
            get () {
                return this.$store.state.Map.scale;
            },
            set (value) {
                this.$store.commit("Map/setScale", value);
            }
        }
    },
```
### mutations in der ScaleSwitcher.vue als methods bereitstellen
In der Datei *modules/tools/scale/components/ScaleSwitcher.vue* "mapMutations" aus vuex und die mutations des ScaleSwitchers importieren. Alle mutations-keys des ScaleSwitchers bereitstellen.
```js
import Tool from "../../Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersScaleSwitcher";
import mutations from "../store/mutationsScaleSwitcher";
...
methods: {
        ...mapMutations("Tools/ScaleSwitcher", Object.keys(mutations)),
    }
```
### Schliessen des Scale-Switcher-Fensters
In der Datei *modules/tools/scaleSwitcher/components/ScaleSwitcher.vue* den lifecycle hook "created" implementieren. Hier wird ein "close"-Listener hinzugefügt, der auf das vom Tool per *emit* gefeuerte Event "close" hört und dann die Methode *close* aufruft. Diese Methode setzt im state *active* auf *false*.

ACHTUNG: Da der core vom masterportal im Moment noch in backbone implementiert ist, muss danach das zugehörige backbone model deaktiviert werden.
```js
...
created () {
    this.$on("close", this.close);
},
...
methods: {
    ...
    close () {
            this.setActive(false);

            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.ScaleSwitcher.id});

            if (model) {
                model.set("isActive", false);
            }
    }
}
```
### Das Template in der ScaleSwitcher.vue füllen
Datei *modules/tools/scaleSwitcher/components/ScaleSwitcher.vue* öffnen und den template-Bereich füllen. Das HTML des ScaleSwitchers liegt innerhalb des Tools in einen weiteren template-Bereich.

- es wird ein slot des Tools angegeben: `<template v-slot:toolBody> ` in dem der ScaleSwitcher gerendert wird.
- dem Tool werden die benötigten Parameter mitgegeben
- das äussere div-Element bekommt eine eindeutige id und die [*v-if* Direktive](https://vuejs.org/v2/api/#v-if) "active". So wird das div und dessen Inhalt nur gerendert, wenn *active* im state *true* ist
- in einer [*v-for* Direktive](https://vuejs.org/v2/api/#v-for) werden die *option*-Elemente mit den Werten der verfügbaren Maßstäbe *scales* aus dem state gefüllt
```html
<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div id="scale-switcher" v-if="active">
                <label
                    for="scale-switcher-select"
                    class="col-md-5 col-sm-5 control-label"
                >Maßstab</label>
                <div class="col-md-7 col-sm-7">
                    <select
                        id="scale-switcher-select"
                        v-model="scale"
                        class="font-arial form-control input-sm pull-left"
                    >
                        <option
                            v-for="(scaleValue, i) in scales"
                            :key="i"
                            :value="scaleValue"
                        >
                            1:{{ scaleValue }}
                        </option>
                    </select>
                </div>
            </div>
        </template>
    </Tool>
</template>
```
### less Regeln definieren
Datei *modules/tools/scaleSwitcher/components/ScaleSwitcher.vue* öffnen und den style-Bereich füllen.
In der Datei *css/variables.less* stehen vordefinierte Variablen zur Verfügung.
```less
<style lang="less" scoped>
    @import "~variables";

    label {
        margin-top: 7px;
    }
    #scale-switcher-select {
        border: 2px solid @secondary;
    }
</style>
```
### Auf die Auswahl eines Maßstabs reagieren
Im template-Bereich der Datei *modules/tools/scaleSwitcher/components/ScaleSwitcher.vue* einen change-Listener zum *select*-Element hinzufügen, der die Methode *setResolutionByIndex* aufruft.
```vue
<select
    id="scale-switcher-select"
    class="font-arial form-control input-sm pull-left"
    @change="setResolutionByIndex($event.target.selectedIndex)"
>
```
Die [Vuex actions](https://vuex.vuejs.org/guide/getters.html#getters) *setResolutionByIndex* der Map wird bereitgestellt. Dazu die mapActions importieren.
Mit *setResolutionByIndex* wird der Maßstab in der Karte gesetzt.
```js
import {mapGetters, mapActions, mapMutations} from "vuex";

methods: {
        ...mapActions("Map", ["setResolutionByIndex"]),
        ...
    }
```

### Internationalisierung
Das Label soll in verschiedenen Sprachen angezeigt werden. Dazu werden in den Übersetzungsdateien (*locales/[de/en]/common.json*) Schlüssel und Übersetzungen eingetragen, siehe [Dokumentation Internationalisierung](languages.de.md).
```js
"modules": {
    "tools": {
        "scaleSwitcher": {
            "label": "Maßstab"
        },
        ... // further translations
```
Auf diese Werte kann mit $t im template-Bereich zugegriffen werden.
```html
<label
    for="scale-switcher-select"
    class="col-md-5 col-sm-5 control-label"
>{{ $t("modules.tools.scaleSwitcher.label") }}</label>
```


### Tool in der config.json konfigurieren
Um das Tool in einem Portal zu verwenden, muss dies in der config.json konfiguriert werden.
```js
      "tools":
      {
        "name": "Werkzeuge",
        "glyphicon": "glyphicon-wrench",
        "children": {
          "scaleSwitcher":
          {
            "name": "translate#common:menu.tools.scaleSwitcher",
            "glyphicon": "glyphicon-resize-full",
            "renderToWindow": true
          },
          ... // further Tools
        }
      }
```
Die Übersetzung des Namens wird in den Übersetzungsdateien (*locales/[de/en]/common.json*) eingetragen.
```js
"common": {
    "menu": {
        "tools": {
             "scaleSwitcher": "Maßstab umschalten"
        }
        ... // further translations
```

