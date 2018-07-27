>Konventionen für unseren Code.

[TOC]

### Allgemein
* Alle Dokumente werden in utf-8 gespeichert
* Jedes Dokument wird mit einer leeren Zeile beendet
* [***EditorConfig***](http://editorconfig.org/) Einstellungen beachten

### ESLint
* [***ESLint***](https://eslint.org/) wird genutzt, um die syntaktische und sonstige Fehler zu verhindern und den Code lesbar und verständlich zu schreiben.
* Wir interpretieren die ESLint Kategorien (warn bzw. error) unterschiedlich.
* Eine "warning" ist ein Hinweis an den Entwickler um zu prüfen, ob der Code hier besser geschrieben werden kann. Sie ist unabhängig von einem approve. Eine Änderung liegt im Ermessensspielraum des Entwicklers.
* Ein "error" verhindert ein approven des PullRequest.

### Whitespace
* Soft Intends (Spaces) statt Tabs
* Vier Spaces repräsentieren einen Tab
* Die Größe der Einrückung beträgt vier Spaces (1 Tab)
* Keine Whitespaces am Ender der Zeile
* Keine leeren "Whitespace Zeilen"

### Funktionen
* Eine Funktion erfüllt genau eine Aufgabe

### Typprüfung
* Zur Typprüfung wird Underscore JS eingesetzt

String:
```
_.isString(variable)
```
Number:
```
_.isNumber(variable)
```
Boolean:
```
_.isBoolean(variable)
```
Object:
```
_.isObject(variable)
```
Array:
```
_.isArray(variable)
```
null:
```
_.isNull(variable)
```
undefined:
```
_.isUndefined(variable)
```
undefined im Template:
```
typeof variable !== "undefined"
```
### Auswertungen
Ob ein Array eine Länge hat:
```
if (array.length) ...
```
Ob ein Array leer ist:
```
if (!array.length) ...
```
Ob ein String nich leer ist:
```
if (string) ...
```
Ob ein String leer ist:
```
if (!string) ...
```

### Bezeichnungen
* Sprechende Namen für Variablen und Funktionen verwenden
* *camelCase* für Funktions- und var- Deklarationen
* Wenn es die String-Variable "dog" gibt, ist "dogList" ein Array bestehend aus "dog" Strings
* Bezeichnung für Konstanten --> SYMBOLIC_CONSTANTS_LIKE_THIS
* Von außen zugeladene Abhängigkeiten werden zur Unterscheidung in *PascalCase* geschrieben, es sei denn die Schreibweise wird innerhalb der Bibliothek anders verwendet

### Anführungszeichen
* Es werden doppelte Anführungszeichen eingesetzt
* Beim Einsatz von inneren und äußeren Anführungszeichen, doppelte Anführungszeichen außen und einfache Anführungszeichen innen
```javascript
var html = "<div id='my-id'></div>";
```

#### Kommentare
* Mehrzeilige Kommentare sind gut
* Funktionen werden wenn überhaupt immer im JSDoc Style kommentiert.

#### Backbone spezifische Konventionen
* "listenTo" anstatt "on" als Eventlistener (nicht Backbone.Radio)
* Die initialize-Funktion ist die erste Funktion in den Backbone-Objekten
* Die render-Funktion ist in jeder View die zweite Funktion
* Die Logik wird im Model programmiert(Controller)
* Variablen, die Model-weit verwendet werden, sind in die Defaults des Models einzutragen
```javascript
defaults: {
    variable1: "test",
    variable2: 123,
    variable3: ["array"],
    variable4: {name: "object"},
    ...
}
```
* Model-weite Variablen werden nur durch Setter-Funktionen gesetzt die am Ende des Models stehen.
```javascript
setVariable1: function (value) {
    this.set("variable1", value);
},
setVariable2: function (value) {
    this.set("variable2", value);
}
```

### Sonstiges
* Comma-First-Formatierung ist verboten
* So wenig globale Variablen wie möglich

### EditorConfig
```ini
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = crlf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

### CSS
* CSS-Code gehört nur in CSS-Dateien und in keine HTML-Dokumente
* Keine ID-Selektoren verwenden
* !improtant vermeiden
* Nach dem Selektor gehört ein Leerzeichen
* Regeln einrücken und über mehrere Zeilen und nicht in einer schreiben
* CSS-Regeln die nur für ein Modul bestimmt sind, werden über das className-Attribut der entsprechenden Backbone.View erstellt

"so nicht" Beispiel:
```css
.btn-panel-submit{background-color: #e6e6e6; border-color: #ccc; color: #333;}
```

"so ja" Beispiel:
```css
.print-tool > .btn-panel-submit {
    background-color: #e6e6e6;
    border-color: #ccc;
    color: #333;
}
```
