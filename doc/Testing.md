# Testing #

##Unit Tests##

**Beispiel:**
*lgv/test/Unittests/ExampleTest/*

**Aufruf**:

[http://localhost:9009/test/unittests/ExampleTest/ExampleTestRunner.html](http://localhost:9009/test/unittests/ExampleTest/ExampleTestRunner.html)
*******************************************************************************

##Wie man Tests schreibt:###

###Ort###
Im Projektverzeichnis */test/unittest*.
In diesem Ordner ist ein Ordner names *modules*.
Hier wird die Struktur unter *lgv/modules* repliziert.
D.h. Zu diesem *modules* Ordner sollte die Testdatei den gleichen relativen Pfad haben, wie die zu testende Datei zum *modules*-Ordner im Projektverzeichnis.

Beispiel:
soll die Datei *modules/tools/download/model.js* getestet werden, dann gehört die Testdatei in *test/modules/tools/download/testModel.js*

Alle Tests zu einer Komponente z.b. einem Model sollen in eine Testdatei mit gleichem Namen und dem präfix *test* davor.

Eine Testdatei beschreibt dabei immer nur genau eine zu testende Datei.


###Struktur###

**BeispielStruktur:**
```

import {expect} from "chai";
import Model from "./testModel.js";

    describe("testModul", function () {
        describe("getEmployeesByName", function () {
             before(function () {
                /* runs before the first it() is executed */
                console.log("before getEmployeesByName");
                model = new Model();
                model.setEmployees([{name: "Robin", coffeeCount: 0}, {name: "Jonas", coffeeCount: 1}]);
            });
             // type test using expect
            it("getEmployeesByName('Jonas') should return an array of length one", function () {
                expect(model.getEmployeesByName("Jonas")).to.be.a("array").with.lengthOf(1);
            });
            it("getEmployeesByName return an array containing ", function () {
                expect(model.getEmployeesByName("Jonas")).to.deep.include({name: "Jonas", coffeeCount: 1});
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


**It** kapselt die einzelnen Testcases. Als erster Parameter wird ein Text übergeben der Beschreibt welche Eigenshcaft die zu testende Methode haben sollte.
Als zweiten Parameter wird eine Callback übergeben, in der mit Hilfe eines *expect* (siehe unten) geprüft wird, ob die Eingenschaft tatsächlich besteht.

**Syntax:**
```
    it(testcaseDesciption, callback)
```

**before** ist eine Funktion, die benutzt werden kann, um Vorbereitungen für eine Gruppe von Tests durchzuführen. Sie wird innerhalb einen **describe** genau *einmal* ausgeführt.

**beforeEach** ist eine Funktion, die benutzt werden kann, um Vorbereitungen für einzelne Testfälle durchzuführen. Sie wird für *jedes* **it** in einem **describe** *einmal* durchgeführt.

[Mehr Infos](https://mochajs.org/)

###Die Testcases###

Innerhalb eines **it** sollte ein **expect** stehen.

**expect** kann genutzt werden, um eine oder mehrere Eigenschaften eines Objektes zu untersuchen.

**Syntax:**
```
 expect(model.testMe()).to.be.true;

 expect(model.testMe()).to.deep.equal({name: "Jon Snow"});
```

[Mehr Infos](http://chaijs.com/api/bdd/)


###Best practices###

Ein Test sollte immer möglichst nur aus genau **einem Grund** fehlschlagen.
D.h. pro **It** sollte möglichst nur ein **expect** verwendet werden.

Tests sollten möglichst **simple** sein. Lieber schnell zwei kleine Tests schreiben als ein kompliziertes Konstrukt das mehrere Sachen auf einmal abdeckt.

Man sollte sich überlegen welche **Corner-Cases** man testen sollte.
D.h. Ungewöhnliche Fälle testen, z.b. sehr hohe oder sehr geringe Eingaben oder unsinnige Eingaben, wie undefined oder ein Leerstring.

Positiv und **negativ** testen.
D.h. nicht nur testen, ob das erwünschte Ergebnis produziert wird, sondern auch, dass keine Unerwünschten Nebeneffekte auftreten.
