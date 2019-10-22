**5. UnitTests**

5.1 **Unittestbare Funktionen** sind nur dann sauber testbar, wenn sie:

5.1.1. Alle verwendeten Parameter übergeben bekommen.

5.1.2. Exakt eine Aufgabe erledigen.

5.1.3. Einen Rückgabewert liefern.

5.1.4. Keine Events feuern oder darauf hören.

5.1.5. Keine Getter oder Setter beinhaltet.

5.1.6. Immer den selben Datentyp zurückgeben.

Beispiel:
```javascript

    function testbareFunktion(uebergabeParameter) {
        let rueckgabeParameter = "Hello " + uebergabeParameter;

        return rueckgabeParameter
    }
```

***
Sind innerhalb eines Prozesses Attribute zu setzen oder Events zu feuern, so sollen Prozessfunktionen verwendet werden.
***
5.2 **Prozessfunktionen** zeichnen sich dadurch aus, dass sie:

5.2.1. Events feuern können, um sich Informationen zu beschaffen.

5.2.2. Selbst kaum Logik enthalten.

5.2.3. Testbare Funktionen aufrufen und mit deren Rückgabewert weiterarbeiten.

5.2.4. Getter und Setter haben können.

Beispiel:
```javascript

    function prozessFunktion() {
        let belibigeVariable = Radio.request("BelibigerChannel", beliebigeFunktion);
        const rueckgabewert= this.testbarefunktion(belibigeVariable);
    }
    .
    .
    .

```

***
5.3 **Unit Tests**

5.3.1. Zu jeder unittestbaren Funktion sind Unit-Tests zu schreiben.

5.3.2. Zum Testen werden die Bibliotheken **[Chai](https://www.chaijs.com/)** und **[Mocha](https://mochajs.org/)** verwendet.

5.3.3. Jedes Model hat eine Test-Datei, die mit **.test.js** endet und unter **[test/unittests/modules](../../test/unittests/modules)** in der selben Ordnerstruktur wie der Code abgelegt wird.

5.3.4 Jede Funktion soll mindestens einen **Positiv-Test** (Funktionsaufruf mit plausiblen Werten) und einen **Negativ-Test** (Funktionsaufruf mit unplausiblen Werten, z.B. *undefined*, *[]*, *{}*, *""*, ...) enthalten.

5.3.5 Alle Unit-Tests müssen fehlerfrei durchlaufen. Dies wird beim pushen durch eine pre-push Hook geprüft.

Beispiel unter **[test/unittests/ExampleTest](../../test/unittests/ExampleTest)**
