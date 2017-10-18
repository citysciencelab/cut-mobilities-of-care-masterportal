
## Tutorial 01: Ein neues Modul erstellen (GeoJSON Loader)
Eine Schritt für Schritt Dokumentation zur Erstellung eines neuen Moduls.

### Beispiel Anforderung
Erstellen sie ein Modul nach dem MV* Muster. Das Modul soll einen einfachen Dialog einblenden, in dem der Dateiname angegeben wird. Nach der Eingabe soll ein Button geklickt werden können, der die Datei mit dem entsprechenden Namen einliest.
Die in der Datei definierten Punkte sollen geparst werden und zu jedem dieser Punkte soll ein Punkt mit Standard-Style auf der Karte erscheinen. Den Inhalt der Datei finden Sie am Ende dieses Dokumentes.
Unter [unserem Wiki](https://bitbucket.org/lgv-g12/lgv/wiki/) finden Sie eine Beschreibung, wie ein Modul erstellt und eingebunden wird, sowie die einzuhaltenden Code-Konventionen.
Bitte lösen Sie die Aufgabe möglichst, mit den von BackboneJs und UnderscoreJs zur Verfügung gestellten Funktionen und Strukturen ohne neue Bibliotheken einzubinden.
Für das (ganz simple gehaltene) Styling bitte das bereits eingebundene Bootstrap verwenden.
Die Kommunikation zwischen den Modulen, soll über Backbone.Radio stattfinden.
Die Daten müssen zu einer GeoJson aufbereitet werden und können über das addGeoJson-Modul in die Karte eingefügt werden.

### Daten
```json
{
    "points": [{
            "breite": "53.5504452870353",
            "laenge": "9.992445722975873"
            },
            {
            "breite": "53.54133266532087",
            "laenge": "9.984246962255547"
            },
            {
            "breite": "53.5482767456604",
            "laenge": "9.97896700399422"
            }
        ]
}

```


### Neues Modul anlegen
Ins Verzeichnis "modules/tools" wechseln und einen neuen Ordner erstellen. Aus dem Ordnernamen sollte ersichtlich sein, um was für ein Modul es sich dabei handelt - z.B. "addPointsFromFile". Die für dieses Modul benötigten Dateien anlegen. In der View (view.js) wird auf Interaktion mit dem Nutzer reagiert und das Tool neu gerendert. Dazu wird das Template (template.html) benötigt, welches den Bauplan des Tools enthält. Im Model (model.js) werden die Daten und deren Logik vorgehalten. Die für das Modul benötigten CSS-Regeln werden in der (style.css) abgelegt.

```
-  modules
   | -> addPointsFromFile
   |    | -> view.js
   |    | -> model.js
   |    | -> template.html
   |    | -> style.css
```

### addPointsFromFile View erstellen und zurückgeben
Datei *modules/tools/addPointsFromFile/view.js* öffnen und die View mit folgendem Standardschema erzeugen.
```js
define(function (require) {
    var Backbone = require("backbone"),
      AddPointsFromFileView;

  AddPointsFromFileView = Backbone.View.extend({
      // wird aufgerufen wenn die View erstellt wird
      initialize: function () {
      }
    });

    return AddPointsFromFileView;
});
```

### AddPointsFromFileView View initialisieren
In die datei *js/app.js* wechseln, AddPointsFromFileView laden und initialiseren. Darauf achten, dass das Modul erst nach dem Core geladen wird.Zuzeit ca. ab Zeile 25.
```js
require(["modules/tools/addPointsFromFile/view"], function (AddPointsFromFileView) {
    new AddPointsFromFileView();
});
```

### Template erstellen
Datei *modules/tools/addPointsFromFile/template.html* öffnen, Template coden und mit Bootstrap Klassen versehen
```html
<!DOCTYPE html>
<div class="form-group">
    <label for="usr">Name:</label>
    <input type="text" class="form-control" id="usr" value="myJsons/points.json">
    <button class="btn btn-default einlesen">Einlesen</button>
</div>
```
### Template in die View einbinden
Das Template muss in die View eingebunden werden. Hierzu wird in einer neuen Variable (Template) das Template required und mithilfe von underscore ("_") als Template zur Verfügung gestellt. Dieses Template wird dem View als Attribut "template" zugefügt.
```js
define(function (require) {
    var Template = require("text!modules/tools/addPointsFromFile/template.html"),
        AddPointsFromFileView;

    AddPointsFromFileView = Backbone.View.extend({
        template: _.template(Template),
        initialize: function () {
        }
    });
    return AddPointsFromFileView;
});
```
### Template initial rendern
Beim Laden der View, soll sich sofort das Tool in der Karte rendern. Dazu wird in der initialize()-Funktion die render()-Funktion aufgerufen. In der render-Funktion passiert folgendes:
* Der View wird das Template zugefügt.
* Danach zeichnet sich die View an den HTML-Body.
```js
define(function (require) {
    var Template = require("text!modules/tools/addPointsFromFile/template.html"),
        AddPointsFromFileView;

    AddPointsFromFileView = Backbone.View.extend({
       template: _.template(Template),
       initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $(".lgv-container").append(this.$el);
        }
    });
    return AddPointsFromFileView;
});
```
Jede View bekommt automatisch ein top level DOM Element (this.el) zugewiesen.
Standardeinstellung für das DOM Element ist ein *div* Tag. In diesem Fall zeichnet sich beim Rendern ein **div** an den "lgv-container". Dieser **div** ist befüllt mit dem Inhalt des **templates**.

### View CSS-Klasse zuweisen
Dem View wird nun noch eine CSS-Klasse ("add-points-from-file") zugewiesen. Über diese Klasse werden beispielsweise CSS-Regeln angewendet.
```js
define(function (require) {
    var Template = require("text!modules/tools/addPointsFromFile/template.html"),
        AddPointsFromFileView;

    AddPointsFromFileView = Backbone.View.extend({
       template: _.template(Template),
       className: "add-points-from-file",
       initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $(".lgv-container").append(this.$el);
        }
    });
    return AddPointsFromFileView;
});
```

### CSS Regeln definieren
Datei *modules/tools/addPointsFromFile/style.css* öffnen und folgenden Code eingeben.
```css
.add-points-from-file {
    position: absolute;
    width: 30%;
    background-color: #fff;
}

```

### CSS importieren
Die CSS-Datei des Moduls muss noch der Projekt-CSS-Datei beigefügt werden.
*css/style.css* öffnen und *modules/tools/addPointsFromFile/style.css* importieren
```css
@charset "utf-8";
...
@import "../modules/tools/addPointsFromFile/style.css";
```

### Model erstellen und zurückgeben
Datei *modules/tools/addPointsFromFile/model.js* öffnen und Model definieren.
```js
define(function (require) {
    var AddPointFromFile;

    AddPointFromFile = Backbone.Model.extend({
    url: "",
    initialize: function () {
    },

    });
    return AddPointFromFile;
});

```

### Model der View zuweisen
Das Model muss dem View bekannt gemacht werden. Im View wird das Model required und per new Model() unter dem Attribut "model" instanziiert.
```js
define(function (require) {
    var Model = require("modules/tools/addPointsFromFile/model"),
        Template = require("text!modules/tools/addPointsFromFile/template.html"),
        AddPointsFromFileView;

    AddPointsFromFileView = Backbone.View.extend({
        model: new Model(),
        template: _.template(Template),
        className: "add-points-from-file",
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $(".lgv-container").append(this.$el);
        }
    });
    return AddPointsFromFileView;
});
```

### Klick-Event registrieren
Der View soll nun auf den Input des Users reagieren. Genauer gesagt soll der View reagieren, wenn der User den "Einlesen"-Button bedient. Wir registrieren den View auf ein Klick-Event auf das DOM-Element mit der Klasse ".einlesen".
Bei einem solchen Event rufen wir eine Funktion im View auf, die das Event an das Model (die Komplette Logik findet hier statt) weiterleitet.

```js
define(function (require) {
    var Model = require("modules/tools/addPointsFromFile/model"),
        Template = require("text!modules/tools/addPointsFromFile/template.html"),
        AddPointsFromFileView;

    AddPointsFromFileView = Backbone.View.extend({
        model: new Model(),
        template: _.template(Template),
        className: "add-points-from-file",
        events: {
            "click .einlesen" : "readFile"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $(".lgv-container").append(this.$el);
        },
        readFile: function (evt) {
            this.model.readFile(evt);
        }
    });
    return AddPointsFromFileView;
});
```
### Logik im Model abbilden
Da im Model die komplette Logik stattfindet, wird hier bei einem Klick auf den "Einlesen"-Button die Funktion readFile(evt) aufgerufen und das Event übergeben.
Diese Parsed die eingegebene JSON-Datei, baut eine GeoJSON-Datei zusammen und fügt diese der Karte hinzu.

```js
define(function (require) {
    var AddPointFromFile;

AddPointFromFile = Backbone.Model.extend({
    url: "test",
    initialize: function () {

    },
    readFile: function (evt) {
        var val = $(evt.currentTarget).parent().find("input").val();

        if (val !== "") {
            this.url = function() {
                return val;
            };
            this.fetch({async: false});
            var rawPoints = this.get("points"),
                geojson = this.createGeoJson(rawPoints);

            Radio.trigger("AddGeoJSON", "addGeoJsonToMap", "PointsAddedFromFile", "111111111", geojson);
        }
    },
    createGeoJson: function (rawPoints) {
        var jsonObj = {
                name: "PointData",
                type: "FeatureCollection",
                features: []
            };

        _.each(rawPoints, function (rawPoint, index) {
            var featureObj = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [parseFloat(rawPoint.laenge, 10), parseFloat(rawPoint.breite, 10)]
                },
                properties: {
                    id: index,
                    type: "point",
                    laengengrad: rawPoint.laenge,
                    breitengrad: rawPoint.breite
                }
            };

            jsonObj.features.push(featureObj);
        });
        return jsonObj
        }
    });
    return AddPointFromFile;
});
```

