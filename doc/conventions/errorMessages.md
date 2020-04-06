**7. sprechende Fehlermeldungen**

7.1. Verwende das Alerting-Modul

    Beispiel mit einfachem Text:
```javascript
    Radio.trigger("Alert", "alert", "My First Alert Message.");
```

7.2. Gib eine sprechende Fehlermeldung, die dem Nutzer erklärt was schiefgelaufen ist.

7.2.1. Bei der Formulierung sollte der User im Vordergrund stehen, nicht der Entwickler oder Konfigurator. Also keine Tech-sprache, keine Fehelermeldungen die sich an den Techniker richten

* Negativ-Beispiel: "CSW-Request fehlgeschlagen".
* Positiv-Beispiel: "Die weiteren Informationen zu Themen konnten nicht geladen werden."

7.2.2. Sei nett! Also nicht den User verantwortlich machen oder negative Formulierungen verwenden. Besser sich erstmal entschuldigen und freundlich bleiben. Am besten so formulieren wie im persönlichen Gespräch.

* Negativ-Beispiel: "Sie haben das Passwort vergessen".
* Positiv-Beispiel: "Bitte geben sie ihr Passwort an".

7.2.3. Sei spezifisch: Fehler nur dann auswerfen, wenn sie relevant für den User sind und sich auf den aktuellen Arbeitsschritt beziehen.

* Negativ-Beispiel: "CSW-request fehlgeschlagen".
* Positiv-Beispiel: "Informationen zu Layer [Layername] konnten nicht geladen werden".

7.2.4. Wenn dem User ein Fehler mitgeteilt wird, sagen

* dass etwas schief gelaufen ist.
* warum etwas schiefgelaufen ist.
* was der User tun kann, um den Fehler zu beheben! Wenn er nichts tun kann überlegen, ob der Fehler dem User mitgeteilt werden muss.

7.3. Gib technische Fehlermeldung (für den Entwickler) als console.error aus.
