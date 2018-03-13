
## Tutorial: Ein neues Modul erstellen (Scale-Switcher)
Eine Schritt für Schritt Dokumentation zur Erstellung eines neuen Moduls.

### Beispiel Anforderung
Wir wollen ein Tool schreiben, über welches man den Kartenmaßstab steuern kann. Dabei soll über ein Drop-Down-Menü der Maßstab ausgewählt werden. Sobald der Maßstab gesetzt wurde, soll sich die Karte anpassen.
Darüber hinaus soll unser Tool auf Änderungen des Kartenmaßstabes reagieren und den entsprechend aktuellen Maßstab im Drop-Down-Menu anzeigen.

### Neues Modul anlegen
Ins Verzeichnis "modules" wechseln und einen neuen Ordner erstellen. Aus dem Ordnernamen sollte ersichtlich sein, um was für ein Modul es sich dabei handelt - z.B. "scale". Die für dieses Modul benötigten Dateien anlegen. In der View (view.js) wird auf Interaktion mit dem Nutzer reagiert und das Tool neu gerendert. Dazu wird das Template (template.html) benötigt, welches den Bauplan des Tools enthält. Im Model (model.js) werden die Daten und deren Logik vorgehalten.
```
-  modules
   | -> scale
   |    | -> view.js
   |    | -> model.js
   |    | -> template.html
   |    | -> style.css
```

### Scale View erstellen und zurückgeben
Datei *modules/scale/view.js* öffnen und die View mit folgendem Standardschema erzeugen.
```js
define(function (require) {
    var Backbone = require("backbone"),
      View;

  View = Backbone.View.extend({
      // wird aufgerufen wenn die View erstellt wird
      initialize: function () {
      }
    });

    return View;
});
```

### Scale View initialisieren
In die datei *js/app.js* wechseln, Scale View laden und initialiseren. Darauf achten, dass das Modul erst nach dem Core geladen wird. Zurzeit ab Zeile 25.
```js
require(["modules/scale/view"], function (ScaleView) {
    new ScaleView();
});
```

### Template erstellen
Datei *modules/scale/template.html* öffnen, Template coden und mit Bootstrap Klassen versehen
```html
<!DOCTYPE html>
<select class="form-control input-sm">
  <option>1</option>
  <option>2</option>
  <option>3</option>
</select>
```
### Template in die View einbinden
Das Template muss in die View eingebunden werden. Hierzu wird in einer neuen Variable (ScaleTemplate) das Template required und mithilfe von underscore ("_") als Template zur Verfügung gestellt. Selbstverständlich muss auch Underscore required werden. Dieses Template wird dem View als Attribut "template" zugefügt.
```js
define(function (require) {
 var ...,
   _ = require("underscore"),
   ScaleTemplate = require("text!modules/scale/template.html"),
   View;

  View = Backbone.View.extend({
    // underscore template Funktion
      template: _.template(ScaleTemplate),
    initialize: function () {
    }
    });
    return View;
});
```
### Template initial rendern
Beim Laden der View, soll sich sofort das Tool in der Karte rendern. Dazu wird in der initialize()-Funktion die render()-Funktion aufgerufen. Dazu benötigen wir "jquery" und requiren dieses als "$". In der render-Funktion passiert folgendes:
Der View wird das Template zugefügt.
Danach zeichnet sich die View an den HTML-Body.
```js
define(function (require) {
    var ...,
      $ = require("jquery"),
      View;

  View = Backbone.View.extend({
      template: _.template(ScaleTemplate),
      initialize: function () {
        this.render();
      },
      // Konvention: Die Methode fürs zeichnen der View, heißt render.
      render: function () {
        $(this.el).html(this.template());
        $("body").append(this.$el);
      }
    });

    return View;
});
```
Jede View bekommt automatisch ein top level DOM Element (this.el) zugewiesen.
Standardeinstellung für das DOM Element ist ein *div* Tag. In diesem Fall zeichnet sich beim rendern ein *div* an den Body. Dieser *div* ist befüllt mit dem Inhalt des *templates*.

### View Id zuweisen
Dem View wird nun noch eine ID zugewiesen. Über diese ID werden beispielsweise CSS-Regeln angewendet.
```js
define(function (require) {
    var ...,
      View;

    View = Backbone.View.extend({
      // Konvention: Id = Name des Moduls
      id: "scale",
      ...
    });

    return View;
});
```

### CSS Regeln definieren
Datei *modules/scale/style.css* öffnen und folgenden Code eingeben.
```css
#scale {
    position: absolute;
    bottom: 30px;
    left: 10px;
    border: 9px solid rgb(182, 0, 0);
}
#scale select {
    padding: 6px 12px;
}
```
Damit es keine Probleme mit CSS Regeln anderer Module gibt, immer von Id der View ausgehen.

### CSS importieren
Datei *css/style.css* öffnen und *modules/scale/style.css* importieren
```css
@charset "utf-8";
...
@import "../modules/scale/style.css";
```

### Model erstellen und zurückgeben
Datei *modules/scale/model.js* öffnen und Model definieren.
```js
define(function (require) {
    var Backbone = require("backbone"),
      Model;

  Model = Backbone.Model.extend({
      // wird aufgerufen wenn das Model erstellt wird
      initialize: function () {...}
    });

    return Model;
});
```

### Model der View zuweisen
In der View wird das Model required und per new ScaleModel() instanziiert.
```js
define(function (require) {
    var ...,
      ScaleModel = require("modules/scale/model")
      View;

  View = Backbone.View.extend({
      id: "scale",
      model: new ScaleModel(),
      ...
    });

    return View;
});
```

### Setter Methoden für das Model schreiben
Mithilfe von Setter-Methoden werden Member-Variablen im Model definiert bzw überschrieben.
```js
define(function (require) {
    var Backbone = require("backbone"),
      Model;

  Model = Backbone.Model.extend({
      initialize: function () {...},
      // Setter für alle verfügbaren Maßstäbe
      setScales: function (value) {
        this.set("scales", value);
      },
      // Setter für den aktuellen Maßstab
      setCurrentScale: function (value) {
        this.set("currentScale", value);
      }
    });

    return Model;
});
```

### Maßstäbe der Karte abfragen und setzen
Die Kommunikation mit anderen Modulen erfolgt über Backbone.Radio. In diesem Fall mit dem *MapView* Modul (*modules/core/mapView.js*), in dem alle Scales definiert sind. Das *MapView* Modul stellt bereits über Backbone.Radio die Funktion *getScales* zur Verfügung, über die alle Scales abgefragt werden können.
Um Radio anzusprechen muss Radio als neue Variable required werden. Diese Maßstäbe werden mittels *Radio* requested und im ScaleModel über die entsprechende Setter-Funktion gesetzt.
```js
define(function (require) {
  var ...,
      Radio = require("backbone.radio"),
      Model;

  Model = Backbone.Model.extend({
      initialize: function () {
        // initial alle Scales der Karte abfragen
        this.setScales(Radio.request("MapView", "getScales"));
      },
      ...
    });

    return Model;
});
```
### Aktuellen Kartenmaßstab abfragen und setzen
Analog zu "getScales" können von der MapView auch der aktuelle Maßstab abgefragt werden. Hierzu werden die aktuellen Optionen requested und von diesem Objekt das Attribut "scale" verwendet. Dieses wird über den entsprechenden Setter als Model-Variable gesetzt.
```js
define(function (require) {
    var ...,
      Model;

  Model = Backbone.Model.extend({
      initialize: function () {
        ...
        this.setCurrentScale(Radio.request("MapView", "getOptions").scale);
      },
      ...
    });

    return Model;
});
```

### Model Attribute ans Template übergeben
Da sich das Template dynamisch aus den Daten des Models erzeugen soll, muss die render()-Funktion erweitert werden. Indem das Model an das Template übergeben wird, können die Model-Variablen im Template verwendet werden.
```js
define(function (require) {
    var ...,
      View;

  View = Backbone.View.extend({
      template: _.template(ScaleTemplate),
      initialize: function () {
        this.render();
      },
      render: function () {
        // alle Model Attribute (currentScale, scales)
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        $("body").append(this.$el);
      }
    });

    return View;
});
```

### Maßstäbe in der View anzeigen bzw. ins Template scripten

```html
<!DOCTYPE html>
<select class="form-control input-sm">
  <% _.each(scales, function (scale) { %>
    <% if (scale === currentScale) { %>
        <option selected><%= scale %></option>
    <% }
    else { %>
        <option><%= scale %></option>
    <% } %>
  <% }); %>
</select>
```

### User Input in der View registrieren
In der View haben wir die Möglichkeit auf events im HTMl zu hören. In diesem Fall wollen wir darauf hören wenn sich im Drop-Down-Menü ein Eintrag geändert hat. Wenn dieses Event eintrifft, überschreiben wir im Model das Attribut "currentScale" mit dem Wert aus dem Drop-Down-Menü. Dafür verwenden wir die Setter-Methode "setCurrentScale".
```js
define(function (require) {
    var ...,
      View;

  View = Backbone.View.extend({
      ...,
      events: {
        // DOM Change Event führt this.setCurrentScale aus
        "change .form-control": "setCurrentScale"
      },
      initialize: function () {...},
      render: function () {...},
      // Ruft im Model die Methode setCurrentScale auf
      setCurrentScale: function (evt) {
        this.model.setCurrentScale(parseInt(evt.target.value, 10));
      }
    });

    return View;
});
```

### Getter Methode für den aktuellen Maßstab schreiben
Über Getter-Methoden können Member-Variablen abgefragt werden. Hier schreiben wir eine Methode, welche die "currentScale", also den aktuellen Maßstab zurückgibt.
```js
define(function (require) {
  var ...,
    Model;

  Model = Backbone.Model.extend({
      initialize: function () {...},
      setScales: function (value) {...},
      setCurrentScale: function (value) {...},
      getCurrentScale: function () {
        return this.get("currentScale");
      }
    });

    return Model;
});
```

### Model Listener auf change:currentScale

```js
define(function (require) {
  var Backbone = require("backbone"),
      Radio = require("backbone.radio"),
      Model;

  Model = Backbone.Model.extend({
      initialize: function () {
        this.listenTo(this, {
            "change:currentScale": function () {
                // Sendet den neuen Maßstab an die MapView
                // Dadurch zoomt die Karte in diesen Maßstab
                Radio.trigger("MapView", "setScale", this.getCurrentScale());
            }
        });
        ...
      },
      setScales: function (value) {...},
      setCurrentScale: function (value) {...},
      getCurrentScale: function () {
        return this.get("currentScale");
      }
    });

    return Model;
});
```

### Model Listener auf MapView changedOptions
Wir wollen nicht nur den Maßstab der Karte setzen können , sondern auch auf Veränderungen des Maßstabs reagieren. Ändert sich der Kartenmaßstab, soll sich in unserem Tool der aktuelle Maßstab anpassen.
Dazu wird in der Initialize-Funktion ein Listener geschrieben. Dieser Hört per Radio auf ein "changedOptions"-Event des Radio-Channels "MapView". Sobald ein solches Event getriggert wird, wird mithilfe unserer Setter-Methode *setCurrentScale()* der aktuelle Maßstab im Model überschrieben.
```js
define(function (require) {
  var Backbone = require("backbone"),
      Radio = require("backbone.radio"),
      Model;

  Model = Backbone.Model.extend({
      initialize: function () {
        this.listenTo(Radio.channel("MapView"), {
            // Wird ausgelöst wenn sich Zoomlevel, Center
            // oder Resolution der Karte ändert
            "changedOptions": function (value) {
                this.setCurrentScale(value.scale);
            }
        });
        ...
      },
      ...
    });

    return Model;
});
```

### View Listener auf change currentScale im Model
Bisher erkennt nur das Model eine Veränderung des aktuellen Kartenmaßstabes. Die View muss jedoch auch darauf hören, wenn sich in seinem Model der aktuelle Maßstab verändert. Denn dann muss sich das Tool neu zeichnen, sodass der aktuelle Maßstab angezeigt wird.
```js
define([
  ...
], function (...) {
    var View = Backbone.View.extend({
      ...
      events: {...}
      initialize: function () {
        this.listenTo(this.model, {
        // Verändert sich der Maßstab der Karte und damit der currentScale
            // des Models, wird die View neu gezeichnet.
            "change:currentScale": this.render
          });
        this.render();
      },
      render: function () {...},
      setCurrentScale: function (evt) {...}
    });

    return View;
});
```
