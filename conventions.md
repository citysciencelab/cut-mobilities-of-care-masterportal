>Konventionen für unseren Code.

[TOC]

### Allgemein
* Alle Dokumente werden in utf-8 gespeichert
* Jedes Dokument wird mit einer leeren Zeile beendet
* [***EditorConfig***](http://editorconfig.org/) und [***ESLint***](https://eslint.org/) werden eingesetzt, um die Konventionen leichter einhalten zu können

### Whitespace
* Soft Intends (Spaces) statt Tabs
* Vier Spaces repräsentieren einen Tab
* Die Größe der Einrückung beträgt vier Spaces (1 Tab)
* Keine Whitespaces am Ender der Zeile
* Keine leeren "Whitespace Zeilen"

### JavaScript
##### Leerzeichen, geschweifte Klammern und Zeilenumbrüche

* *if / else / for / while / try* enthalten immer Leerzeichen, geschweifte Klammern und erstrecken sich über mehrere Zeilen
* keine leeren Blöcke

"so nicht" Beispiele:
```javascript
if(Bedingung) machWas();

while(Bedingung) iterieren++;

for(var i=0;i<100;i++) machWas();
```

"so ja" Beispiele:
```javascript
if (Bedingung) {
    // statements
}
else {
    // statements
}

while (Bedingung) {
    // statements
}

for (var i = 0; i < 100; i++) {
    // statements
}
```

#### Zuweisungen, Deklarationen, Funktionen
* Nur einmal "var" pro Scope (Funktion) verwenden
```javascript
// so nicht
var foo = "";
var bar = "";
var foobar;
// sondern so
var foo = "",
      bar = "",
      foobar;
```
* "var" am Anfang der Funktion definieren
* Eine Funktion erfüllt genau eine Aufgabe
* Object und Array ohne new Operator erzeugen
* Definierte Variable, Parameter oder Funktionen die nicht genutzt werden vermeiden

"so nicht" Beispiele:
```javascript
var car = new Object();
car.goes = "far";
var cars = new Array();
```
"so ja" Beispiele:
```javascript
var car = {goes:"far"};
var cars = [];
```

#### Typprüfung
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
#### Auswertungen
* Vergleiche mit **"==="** und **"!=="** anstatt mit **"=="** und **"!="**

Ob ein Array eine Länge hat:
```
if ( array.length ) ...
```
Ob ein Array leer ist:
```
if ( !array.length ) ...
```
Ob ein String nich leer ist:
```
if ( string ) ...
```
Ob ein String leer ist:
```
if ( !string ) ...
```

#### Bezeichnungen
* Sprechende Namen für Variablen und Funktionen verwenden
* camelCase für Funktions- und var- Deklarationen
* Wenn es die String-Variable "dog" gibt, ist "dogList" ein Array bestehend aus "dog" Strings
* Bezeichnung für Konstanten --> SYMBOLIC_CONSTANTS_LIKE_THIS

#### Anführungszeichen
* Es werden doppelte Anführungszeichen eingesetzt
* Beim Einsatz von inneren und äußeren Anführungszeichen, doppelte Anführungszeichen außen und einfache Anführungszeichen innen
```javascript
var html = "<div id='my-id'></div>";
```

#### Kommentare
* Mehrzeilige Kommentare sind gut
* JSDoc Style Kommentare sind gut, aber erfordern mehr Zeit

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
* Model-weite Variablen werden nur durch Setter- und Getter-Funktionen geholt oder gesetzt, die paarweise am Ende des Models stehen.
```javascript
setVariable1: function (value) {
    this.set("variable1", value);
},
getVariable1: function () {
    return this.get("variable1");
},
setVariable2: function (value) {
    this.set("variable2", value);
},
getVariable2: function () {
    return this.get("variable2");
}
```
"so nicht" Beispiele:
```javascript
randomFunc: function () {
    var modelVar1 = this.get("variable1");
    ...
}
```
"so ja" Beispiele:
```javascript
randomFunc: function () {
    var modelVar1 = this.getVariable1();
    ...
}
```

#### Sonstiges
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
