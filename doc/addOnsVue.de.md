# Vue.js Addons #

Um eigene Entwicklungen in das MasterPortal zu integrieren existiert ein Mechanismus der es erlaubt, Code von außerhalb des MasterPortal-Repositories in die MasterPortal Sourcen zu integrieren. Siehe auch **[lokale Entwicklungsumgebung einrichten](setupDev.de.md)**.

Das Addon selbst ist identisch wie ein natives Modul zu programmieren (siehe auch **[Tutorial 01: Ein neues Modul erstellen (Scale Switcher)](vueTutorial.de.md)**). Es liegt lediglich außerhalb des Repositories und erlaubt so eine getrennte Verwaltung.

Alle Addons liegen in einem Ordner namens "addons" auf Root-Ebene des Masterportals. Beliebig viele dieser Addons lassen sich in einem Portal in der **[config.js](config.js.de.md)** konfigurieren. Es ist möglich, dass Addons eine eigene `package.json` Datei besitzen, um weitere Dependencies zu definieren.

Folgende Struktur ist dabei zu beachten, hier am Beispiel eines Werkzeuges (MyAddon1) und eines GFI-Themes (MyGfiTheme):

## 1. Dateistruktur von Addons ##

1.1.
```
addons
|-- myAddon1
|    index.js
|   |-- components
|	|   |-- MyAddon1.vue
|   |   |-- ...
|	|-- store
|   |   |-- actionsMyAddon1.js
|   |   |-- gettersMyAddon1.js
|   |   |-- indexMyAddon1.js
|   |   |-- mutationsMyAddon1.js
|   |   |-- index.js
|   |
|	|-- locales
|	|   |-- de
|   |	|   |-- additional.json
|	|   |-- en
|   |	|   |-- additional.json
|   |
|	|-- doc
|	|   |-- config.json.md
|   |
|	|-- test
|	|   |-- end2end
|   |	|   |-- MyAddon1.e2e.js
|	|   |-- unit
|   |	|   |-- components
|   |   |	|   |-- MyAddon1.spec.js
|   |	|   |-- store
|   |   |	|   |-- actionsMyAddon1.spec.js
|   |   |	|   |-- gettersMyAddon1.spec.js
|   |   |	|   |-- mutationsMyAddon1.spec.js
|   |
|   |-- package.json

|-- myGfiTheme
|   index.js
|   |-- components
|	|   |-- MyGfiTheme.vue
|   |   |-- ...
|	|-- locales
|	|   |-- de
|   |	|   |-- additional.json
|	|   |-- en
|   |	|   |-- additional.json
|   |
|	|-- doc
|	|   |-- config.json.md
|   |
|	|-- tests
|	|   |-- end2end
|   |	|   |-- MyGfiTheme.e2e.js
|	|   |-- unit
|   |	|   |-- components
|   |   |	|   |-- MyGfiTheme.spec.js
|   |
|   |-- package.json

|-- MyGFIThemesFolder
|   |-- myGFISubFolder
|   |   index.js
|   |   |-- components
|   |   |   |-- MyGfiTheme.vue
|   |   |   |-- ...
|   |   |-- locales
|   |   |   |-- de
|   |   |   |   |-- additional.json
|   |   |   |-- en
|   |   |   |   |-- additional.json
|   |   |
|   |   |-- doc
|   |   |   |-- config.json.md
|   |   |
|   |   |-- tests
|   |   |   |-- end2end
|   |   |   |   |-- MyGfiTheme.e2e.js
|   |   |   |-- unit
|   |   |   |   |-- components
|   |   |   |   |   |-- MyGfiTheme.spec.js
|   |   |
|   |   |-- package.json



```
Der Entrypoint eines jeden Addons muss eine Datei namens **index.js** auf der root-Ebene des Addon-Folders sein.

1.2. Direkt in dem Ordner muss die Konfigurationsdatei **addonsConf.json** liegen. Diese beinhaltet einen JSON bestehend aus den *Namen* der *Addons* als Keys und weiteren Angaben zum Addon.

Das nachfolgende Beispiel basiert auf der oben beispielhaft beschriebenen Ordnerstruktur.

Es werden 2 Arten von Addons unterstützt:

Werkzeuge: `"type": "tool"`

GFI-Themes: `"type": "gfiTheme"`

Von allen Einträgen in der addonsConf.json, die ein Objekt enthalten wird davon ausgegangen, dass sie mit vue programmiert sind (alte backbone-ddons enthalten nur einen String).

Standardmäßig entspricht der Key eines Addons dem Namen seines Ordners im Addons Ordner. Mit dem Parameter "path" jedoch kann ein willkürlicher Pfad definiert werden. Dadurch können mehrere Addons in Ordnern gruppiert werden.

#### Beispiel **addonsConf.json** ####
```json
{
  [...]
  "myAddon1": {
    "type": "tool"
  },
  "myGfiTheme": {
    "type": "gfiTheme"
  },
  "anotherGFITheme": {
    "type": "gfiTheme",
    "path": "myGFIThemesFolder/myGFISubFolder"
  }
}
```

1.3. Es sollen hier ausschließlich nur die Dateien landen, welche zu *addons* gehören.

1.4 Falls weitere Dependencies, die noch nicht im Masterportal vorhanden sind, für ein Addon benötigt werden, können diese über eine separate `package.json` installiert werden. Dazu reicht eine minimale `package.json` aus:

#### Beispiel **package.json** ####
```json
{
  "name": "exampleAddon",
  "version": "1.0.0",
  "description": "I'm an example! I can say hello world.",
  "dependencies": {
    "hello": "^0.3.2"
  }
}

```

`npm install` muss für jedes Addon separat ausgeführt werden!

## 2. Beispiel-Addon ##

Hier legen wir ein kurzes Beispiel-Addon für ein Werkzeug an!

2.1. Dateien erstellen: Das Beispiel-Addon trägt den Namen *VueAddon* und seine Entrypoint-Datei heißt *index.js*. Die Komponente *VueAddon.vue* liegt im Ordner *components*. Daraus ergibt sich eine Dateistruktur wie folgt:

```
myMasterPortalFolder/
    addons/
        vueAddon/
            index.js
            components/
                VueAddon.vue
            store
                index.js
    devtools/
    doc/
    [...]
```

2.2. Addon-Code schreiben:

```js
// myMasterPortalFolder/addons/vueAddon/store/index.js

import GenericTool from "../../../src/modules/tools/indexTools";
import composeModules from "../../../src/app-store/utils/composeModules";
import getters from "./gettersVueAddon";
import mutations from "./mutationsVueAddon";
import actions from "./actionsVueAddon";
import state from "./stateVueAddon";

export default composeModules([GenericTool, {
    namespaced: true, //mandatory
    state,
    mutations,
    actions,
    getters
}]);
```

Der `state`, die `mutations`, `actions` und `getters` können in separaten Dateien liegen oder werden hier direkt angegeben. Die Angabe von ```namespaced:true``` ist verpflichtend.

```vue
// myMasterPortalFolder/addons/vueAddon/components/VueAddon.vue

<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersVueAddon";
import mutations from "../store/mutationsVueAddon";

export default {
    name: "VueAddon",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/VueAddon", Object.keys(getters))
    },
    created () {
        this.$on("close", this.close);
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.initialize();
        if (this.isActive) {
            this.setActive(true);
        }
        this.activateByUrlParam();
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapActions("Tools/VueAddon", [
            "activateByUrlParam",
            "initialize"
        ]),
        ...mapMutations("Tools/VueAddon", Object.keys(mutations)),

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.VueAddon.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

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
            <div
                v-if="active"
                id="vue-addon"
            >
                {{ $t("additional:modules.tools.vueAddon.content") }}
            </div>
        </template>
    </Tool>
</template>
```

2.3 Die `index.js` Datei schreiben:
Die `index.js` dient dazu alle Komponenten (Vue-Components, Store und Übersetzungen) zu aggregieren und als einen
Entrypoint bereit zustellen.

Auch wenn man theoretisch den Entrypoint in der `addonsConf.json` beliebig setzen kann, muss dieser zwingend auf `index.js` bleiben da webpack sonst das Addon nicht laden wird!

Wichtig ist, dass alle Komponenten korrekt importiert werden und nicht in einem `.default` eine Ebene tiefer im Objekt
liegen (z.B. wenn man `import * as VueAddonComponent from "./components/VueAddon.vue";` verwendet).

```js
// myMasterPortalFolder/addons/VueAddon/index.js
import VueAddonComponent from "./components/VueAddon.vue";
import VueAddonStore from "./store/VueAddon";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: VueAddonComponent,
    store: VueAddonStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
```

2.4. Die Addons-Config-Datei erstellen:

```json
// myMasterPortalFolder/addons/addonsConf.json

{
  "vueAddon": {
    "type": "tool"
  }
}
```

2.5. Das Beispiel-Addon in der config.js Datei des Portals aktivieren:

```js
// myMasterPortalFolder/config.js

const Config = {
    // [...]
    addons: ["VueAddon"],
    // [...]
};
```

2.6. Das Beispiel-Addon als Werkzeug in der config.json definieren, damit es als Menüpunkt erscheint.

```json
// myMasterPortalFolder/config.json
...
    "tools": {
        "name": "Werkzeuge",
        "glyphicon": "glyphicon-wrench",
        "children": {
           "VueAddon": {
                "name": "translate#additional:modules.tools.vueAddon.title",
                "glyphicon": "glyphicon-th-list"
          },
```

2.7. JSDoc schreiben. Dazu einen im Ordner jsdoc einen Datei namespaces.js anlegen und als memberOf Addons **eintragen**.

```js
/**
 * @namespace ExampleAddon
 * @memberof Addons
 */
```

2.8. In der model.js muss bei memberOf als Prefix Addons. angegeben werden.

```js
/**
* @class exampleAddon
* @extends Tool
* @memberof Addons.ExampleAddon
* @constructs
*/
```
