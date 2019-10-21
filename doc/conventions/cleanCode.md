**1. Clean Code**

1.1. Verwende **sprechende Namen** für Variablen, Konstanten und Funktionen.

1.2. Verwende **[camelCase](https://de.wikipedia.org/wiki/Binnenmajuskel#Programmiersprachen)** für Variablen und Funktionsnamen.

1.3. Verwende **[PascalCase](https://de.wikipedia.org/wiki/Binnenmajuskel)** für von außen zugeladene Abhängigkeiten, es sei denn die Schreibweise wird innerhalb der Bibliothek anders verwendet.

1.4. Verwende **const** und **let** zur Deklaration von Variablen und Konstanten.

1.4.1 **const** und **let** dürfen nur am Anfang eines scopes stehen.

1.4.2 **const** und **let** haben nur eine Variable pro Zeile.

Beispiel:
```javascript

    const a,
        b;
    let c,
        d;
```

1.5. Eine Funktion ist nur für eine Sache zuständig.

1.6. Arbeite mit **[Prozessfunktionen](unitTests.md)** und **[Unit-testbaren Funktionen](unitTests.md)**.

1.7. Vermeide unnötige Inline-Kommentare.

1.8. Verwende **keine [ungarische Notation](https://de.wikipedia.org/wiki/Ungarische_Notation)** (Variablen-Deklaration mit Präfix für den Datentyp, z.B. bFooBar).
