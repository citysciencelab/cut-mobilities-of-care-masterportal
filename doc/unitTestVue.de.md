## Unit Tests ##

**Beispiel:**
*masterportal/src/modules/tools/scaleSwitcher/tests*

**Aufrufe**:

npm run test:vue

npm run test:vue:watch
*******************************************************************************

## Wie man Tests schreibt: ###

### Ort ###

Die Tests *.spec.js liegen neben der Komponente und dem Store. Hier am Beispiel des ScaleSwitchers:
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
|   |   |   |   |-- gettersScaleSwitcher.js
|   |   |   |   |-- indexScaleSwitcher.js
|   |   |   |   |-- mutationsScaleSwitcher.js
|   |   |   |   |-- stateScaleSwitcher.js
|   |   |   |
|   |   |	|-- tests
|   |   |	|   |-- end2end
|   |   |   |	|   |-- ScaleSwitcher.e2e.js
|   |   |	|   |-- unit
|   |   |   |	|   |-- components
|   |   |   |   |	|   |-- ScaleSwitcher.spec.js
|   |   |   |	|   |-- store
|   |   |   |   |	|   |-- actionsScaleSwitcher.spec.js
|   |   |   |   |	|   |-- gettersScaleSwitcher.spec.js
|   |   |   |   |	|   |-- mutationsScaleSwitcher.spec.js
```



### Struktur ###

**BeispielStruktur: Komponente testen**


Komponente *modules/tools/scaleSwitcher/components/ScaleSwitcher.vue*
```js

import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import ScaleSwitcherComponent from "../../../components/ScaleSwitcher.vue";
import ScaleSwitcher from "../../../store/indexScaleSwitcher";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/scaleSwitcher/components/ScaleSwitcher.vue", () => {
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
            namespaced: true,
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

    it("select another scale changes scale in map", async () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue}),
            options = wrapper.findAll("option");

        options.at(1).trigger("change");
        await wrapper.vm.$nextTick();
        expect(options.at(1).attributes().selected).to.equals("true");
        expect(options.at(0).attributes().selected).to.be.undefined;
        expect(options.at(2).attributes().selected).to.be.undefined;
        // maps scale change should be called
        expect(mockMapActions.setResolutionByIndex.calledOnce).to.equal(true);

        options.at(2).trigger("change");
        await wrapper.vm.$nextTick();
        expect(options.at(2).attributes().selected).to.equals("true");
        // maps scale change should be called
        expect(mockMapActions.setResolutionByIndex.calledTwice).to.equal(true);
    });

    it("method selectionChanged shall change currentScale", async () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue}),
            event = {
                target: {
                    value: scales[1],
                    selectedIndex: 1
                }
            };

        wrapper.vm.selectionChanged(event);
        await wrapper.vm.$nextTick();

        expect(store.state.Tools.ScaleSwitcher.currentScale).to.equals(scales[1]);
    });
});
```
**BeispielStruktur: getters testen**


Datei *modules/tools/scaleSwitcher/store/gettersScaleSwitcher.js*
```js

import {expect} from "chai";
import getters from "../../../store/gettersScaleSwitcher";
import stateScaleSwitcher from "../../../store/stateScaleSwitcher";


const {currentScale} = getters;

describe("src/modules/tools/scaleSwitcher/store/gettersScaleSwitcher.js", () => {
    describe("getCurrentScale", () => {
        it("returns the scale from state", () => {
            const state = {
                currentScale: "1000"
            };

            expect(currentScale(state)).to.equals("1000");
        });
    });
    describe("testing default values", () => {
        it("returns the name default value from state", () => {
            expect(name(stateScaleSwitcher)).to.be.equals("common:menu.tools.scaleSwitcher");
        });
        // (...) - weitere default-Werte testen
    });
});

```
**BeispielStruktur: actions testen**

Datei *modules/tools/scaleSwitcher/store/actionsScaleSwitcher.js*

Es wird die Funktion *testAction* aus *test/unittests/VueTestUtils* genutzt.
```js
import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsScaleSwitcher";

const {setActive, activateByUrlParam} = actions;

describe("src/modules/tools/scaleSwitcher/store/actionsScaleSwitcher.js", () => {
    describe("setActive", () => {
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

Datei *modules/tools/scaleSwitcher/store/mutationsScaleSwitcher.js*
```js

import {expect} from "chai";
import mutations from "../../../store/mutationsScaleSwitcher";


const {setCurrentScale} = mutations;

describe("src/modules/tools/scaleSwitcher/store/mutationsScaleSwitcher.js", () => {
    describe("setCurrentScale", () => {
        it("sets the scale to state", () => {
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

### mocha ###

**Describe** wird benutzt um einen Abschnitt Kenntlich zu machen.
Im Beispiel wird das Äußere **describe** benutzt, um zu beschreiben Welches Modul getestet wird.
Im Inneren **describe** wird die Funktion, die gerade getestet werden soll beschrieben.

**Syntax:**
```js
    describe(name, callback)
```


**It** kapselt die einzelnen Testcases. Als erster Parameter wird ein Text übergeben der Beschreibt welche Eigenschaft die zu testende Methode haben sollte.
Als zweiten Parameter wird eine Callback übergeben, in der mit Hilfe eines *expect* (siehe unten) geprüft wird, ob die Eingenschaft tatsächlich besteht.

**Syntax:**
```js
    it(testcaseDescription, callback)
```

**before** ist eine Funktion, die benutzt werden kann, um Vorbereitungen für eine Gruppe von Tests durchzuführen. Sie wird innerhalb einen **describe** genau *einmal* ausgeführt.

**beforeEach** ist eine Funktion, die benutzt werden kann, um Vorbereitungen für einzelne Testfälle durchzuführen. Sie wird für *jedes* **it** in einem **describe** *einmal* durchgeführt.

[mehr Infos zu mocha](https://mochajs.org/)

### chai ###

Innerhalb eines **it** sollte ein **expect** stehen.

**expect** kann genutzt werden, um eine oder mehrere Eigenschaften eines Objektes zu untersuchen.

**Syntax:**
```js
 expect(model.testMe()).to.be.true;

 expect(model.testMe()).to.deep.equal({name: "Jon Snow"});
```

[mehr Infos zu chai](https://chaijs.com/api/bdd/)


### Best practices ###

Ein Test sollte immer möglichst nur aus genau **einem Grund** fehlschlagen.
D.h. pro **It** sollte möglichst nur ein **expect** verwendet werden.

Tests sollten möglichst **simple** sein. Lieber schnell zwei kleine Tests schreiben als ein kompliziertes Konstrukt das mehrere Sachen auf einmal abdeckt.

Man sollte sich überlegen welche **Corner-Cases** man testen sollte.
D.h. Ungewöhnliche Fälle testen, z.b. sehr hohe oder sehr geringe Eingaben oder unsinnige Eingaben, wie undefined oder ein Leerstring.

Positiv und **negativ** testen.
D.h. nicht nur testen, ob das erwünschte Ergebnis produziert wird, sondern auch, dass keine Unerwünschten Nebeneffekte auftreten.

### Links ###

[vue test utils](https://vue-test-utils.vuejs.org/)

[vue-testing-handbook](https://lmiller1990.github.io/vue-testing-handbook/)

[vue.js testing guide](https://vuejs.org/v2/guide/unit-testing.html#ad)

[vuex testing](https://vuex.vuejs.org/guide/testing.html)
