##Unit Tests##

**Beispiel:**
*masterportal/src/modules/tools/scale/tests*

**Aufrufe**:

npm run test:vue
npm run test:vue:watch
*******************************************************************************

##Wie man Tests schreibt:###

###Ort###

Die Tests liegen neben der Komponente und dem Store. Hier am Beispiel des ScaleSwitchers:
```
src
|-- modules
|   |-- tools
|   |   |-- scale
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
|   |   |   |   |	|   |-- SScaleSwitcher.spec.js
|   |   |   |	|   |-- store
|   |   |   |   |	|   |-- actionsScaleSwitcher.test.js
|   |   |   |   |	|   |-- gettersScaleSwitcher.test.js
|   |   |   |   |	|   |-- mutationsScaleSwitcher.test.js
```



###Struktur###

**BeispielStruktur: Komponente testen**

Komponente *modules/tools/scale/components/ScaleSwitcher.vue*
```

import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import ScaleSwitcherComponent from "../../../components/ScaleSwitcher.vue";
import ScaleSwitcher from "../../../store/indexScaleSwitcher";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("ScaleSwitcher.vue", () => {
    const scales = ["1000", "5000", "10000"],
        mockMapGetters = {
            scales: () => scales,
            scale: sinon.stub(),
            getView: sinon.stub()
        },
        mockMapActions = {
            setResolutionByIndex: sinon.stub()
        },
        mockMapMutations = {
            setScale: sinon.stub()
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            scaleSwitcher:
                            {
                                "name": "translate#common:menu.tools.scaleSwitcher",
                                "glyphicon": "glyphicon-resize-full",
                                "renderToWindow": true
                            }
                        }
                    }
                }
            }
        };
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        ScaleSwitcher
                    }
                },
                Map: {
                    namespaced: true,
                    getters: mockMapGetters,
                    mutations: mockMapMutations,
                    actions: mockMapActions
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.dispatch("Tools/ScaleSwitcher/setActive", true);
    });

    it("renders the scaleSwitcher", () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});

        expect(wrapper.find("#scale-switcher").exists()).to.be.true;
    });

    it("do not render the scaleSwitchers select if not active", () => {
        store.dispatch("Tools/ScaleSwitcher/setActive", false);
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});

        expect(wrapper.find("#scale-switcher").exists()).to.be.false;
    });

    it("has initially set all scales to select", () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue}),
            options = wrapper.findAll("option");

        expect(options.length).to.equal(scales.length);
        scales.forEach((scale, index) => {
            expect(scale).to.equal(options.at(index).attributes().value);
        });
    });
});
```
**BeispielStruktur: getters testen**

Datei *modules/tools/scale/store/gettersScaleSwitcher.js*
```
import {expect} from "chai";
import getters from "../../../store/gettersScaleSwitcher";
import stateScaleSwitcher from "../../../store/stateScaleSwitcher";


const {currentScale} = getters;

describe("gettersScaleSwitcher", function () {
    describe("getCurrentScale", function () {
        it("returns the scale from state", function () {
            const state = {
                currentScale: "1000"
            };

            expect(currentScale(state)).to.equals("1000");
        });
    });
});

```
**BeispielStruktur: actions testen**

Datei *modules/tools/scale/store/actionsScaleSwitcher.js*
```
import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsScaleSwitcher";

const {setActive, activateByUrlParam} = actions;

describe("actionsScaleSwitcher", function () {
    describe("activateByUrlParam", function () {
        it("activateByUrlParam  isinitopen=scaleSwitcher", done => {
            const rootState = {
                queryParams: {
                    "isinitopen": "scaleSwitcher"
                }
            };

            testAction(activateByUrlParam, null, {active: false}, rootState, [
                {type: "setActive", payload: true}
            ], {}, done);
        });
        it("activateByUrlParam no isinitopen", done => {
            const rootState = {
                queryParams: {
                }
            };

            testAction(activateByUrlParam, null, {active: false}, rootState, [], {}, done);
        });
    });
    describe("setActive", function () {
        const rootState = {
            Map: {
                scale: "60033.65329850641"
            }
        };

        it("setActive(true) should set rounded currentScale", done => {
            const payload = true,
                mutationActivePayload = true,
                mutationScalePayload = 60000;

            testAction(setActive, payload, {}, rootState, [
                {type: "setActive", payload: mutationActivePayload},
                {type: "setCurrentScale", payload: mutationScalePayload}
            ], {}, done);

        });
        it("setActive(false) should not set currentScale", done => {
            const payload = false,
                mutationActivePayload = false;

            testAction(setActive, payload, {}, rootState, [
                {type: "setActive", payload: mutationActivePayload}
            ], {}, done);

        });
    });
});

```

**BeispielStruktur: mutations testen**
Datei *modules/tools/scale/store/mutationsScaleSwitcher.js*
```
import {expect} from "chai";
import mutations from "../../../store/mutationsScaleSwitcher";


const {setCurrentScale} = mutations;

describe("mutationsScaleSwitcher", function () {
    describe("setCurrentScale", function () {
        it("sets the scale to state", function () {
            const state = {
                currentScale: null
            },
            payload = "1000";

            setCurrentScale(state, payload)
            expect(state.currentScale).to.equals("1000");
        });
    });
});
```

**Describe** wird benutzt um einen Abschnitt Kenntlich zu machen.
Im Beispiel wird das Äußere **describe** benutzt, um zu beschreiben Welches Modul getestet wird.
Im Inneren **describe** wird die Funktion, die gerade getestet werden soll beschrieben.

**Syntax:**
```
    describe(name, callback)
```


**It** kapselt die einzelnen Testcases. Als erster Parameter wird ein Text übergeben der Beschreibt welche Eigenschaft die zu testende Methode haben sollte.
Als zweiten Parameter wird eine Callback übergeben, in der mit Hilfe eines *expect* (siehe unten) geprüft wird, ob die Eingenschaft tatsächlich besteht.

**Syntax:**
```
    it(testcaseDescription, callback)
```

**before** ist eine Funktion, die benutzt werden kann, um Vorbereitungen für eine Gruppe von Tests durchzuführen. Sie wird innerhalb einen **describe** genau *einmal* ausgeführt.

**beforeEach** ist eine Funktion, die benutzt werden kann, um Vorbereitungen für einzelne Testfälle durchzuführen. Sie wird für *jedes* **it** in einem **describe** *einmal* durchgeführt.

[mehr Infos zu mocha](https://mochajs.org/)

###Die Testcases###

Innerhalb eines **it** sollte ein **expect** stehen.

**expect** kann genutzt werden, um eine oder mehrere Eigenschaften eines Objektes zu untersuchen.

**Syntax:**
```
 expect(model.testMe()).to.be.true;

 expect(model.testMe()).to.deep.equal({name: "Jon Snow"});
```

[mehr Infos zu chai](https://chaijs.com/api/bdd/)


###Best practices###

Ein Test sollte immer möglichst nur aus genau **einem Grund** fehlschlagen.
D.h. pro **It** sollte möglichst nur ein **expect** verwendet werden.

Tests sollten möglichst **simple** sein. Lieber schnell zwei kleine Tests schreiben als ein kompliziertes Konstrukt das mehrere Sachen auf einmal abdeckt.

Man sollte sich überlegen welche **Corner-Cases** man testen sollte.
D.h. Ungewöhnliche Fälle testen, z.b. sehr hohe oder sehr geringe Eingaben oder unsinnige Eingaben, wie undefined oder ein Leerstring.

Positiv und **negativ** testen.
D.h. nicht nur testen, ob das erwünschte Ergebnis produziert wird, sondern auch, dass keine Unerwünschten Nebeneffekte auftreten.

###Links###

[vue test utils](https://vue-test-utils.vuejs.org/)

[vue-testing-handbook](https://lmiller1990.github.io/vue-testing-handbook/)

[vue.js testing guide](https://vuejs.org/v2/guide/unit-testing.html#ad)

[vuev testing](https://vuex.vuejs.org/guide/testing.html)
