
## Tutorial: Ein neues Modul erstellen
Eine Schritt für Schritt Dokumentation zur Erstellung eines neuen Moduls.

### Beispiel Anforderung
Über ein Feld, in dem immer der aktuell verwendete Maßstab angezeigt wird, können über ein Drop-down-Menü voreingestellte Maßstabszahlen ausgewählt werden.
Das Kartenbild springt anschließend zu der entsprechenden Zoomstufe.

### Neues Modul anlegen
Ins Verzeichnis "modules" wechsel und einen neuen Ordner erstellen. Aus dem Ordnernamen sollte ersichtlich sein, um was für ein Modul es sich dabei handelt - z.B. "scale". Die für dieses Modul benötigten Dateien anlegen.
```
-  modules
   | -> scale
   |    | -> view.js
   |    | -> model.js
   |    | -> template.html
   |    | -> style.css
```

### Scale View erstellen und zurückgeben
Datei *modules/scale/view.js* öffnen und View mit folgendem Standardschema erzeugen.
```js
define([
  "backbone"
], function (Backbone) {

    var View = Backbone.View.extend({
      // wird aufgerufen wenn die View erstellt wird
      initialize: function () {}
    });

    return View;
});
```

### Scale View initialisieren
In die datei *js/app.js* wechsel, Scale View laden und initialiseren. Darauf achten, dass das Modul erst nach dem Core geladen wird. Zurzeit ab Zeile 25.
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
```js
define([
  "backbone",
  "underscore",
  // stellt das Template als String Variable zur Verfügung
  "text!modules/scale/template.html"
], function (Backbone, _, ScaleTemplate) {

    var View = Backbone.View.extend({
      // underscore template Funktion
      template: _.template(ScaleTemplate),
      initialize: function () {}
    });

    return View;
});
```
### Template initial rendern
```js
define([
  "backbone",
  "underscore",
  "text!modules/scale/template.html",
  "jquery"
], function (Backbone, _, ScaleTemplate, $) {

    var View = Backbone.View.extend({
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
Standardeinstellung für das DOM Element ist ein *div* Tag.

### View Id zuweisen
```js
define([
  "backbone",
  "underscore",
  "text!modules/scale/template.html",
  "jquery"
], function (Backbone, _, ScaleTemplate, $) {

    var View = Backbone.View.extend({
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

@import "../components/bootstrap/dist/css/bootstrap.css";
@import "../components/openlayers/ol.css";
...
@import "../modules/scale/style.css";
```

### Model erstellen und zurückgeben
Datei *modules/scale/model.js* öffnen und Model definieren.
```js
define([
  "backbone"
], function (Backbone) {

    var Model = Backbone.Model.extend({
      // wird aufgerufen wenn das Model erstellt wird
      initialize: function () {...}
    });

    return Model;
});
```

### Model der View zuweisen
```js
define([
  "backbone",
  "underscore",
  "text!modules/scale/template.html",
  "jquery",
  "modules/scale/model"
], function (Backbone, _, ScaleTemplate, $, ScaleModel) {

    var View = Backbone.View.extend({
      id: "scale",
      model: new ScaleModel(),
      ...
    });

    return View;
});
```

### Setter Methoden für das Model schreiben
```js
define([
  "backbone"
], function (Backbone) {

    var Model = Backbone.Model.extend({
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
```js
define([
  "backbone",
  "backbone.radio"
], function (Backbone, Radio) {

    var Model = Backbone.Model.extend({
      initialize: function () {
        // initial alle Scales der Karte abfragen
        var scales = Radio.request("MapView", "getScales");

        this.setScales(scales);
      },
      setScales: function (value) {...},
      setCurrentScale: function (value) {...}
    });

    return Model;
});
```
Die Kommunikation mit anderen Modulen erfolgt über Backbone.Radio. In diesem Fall mit dem *MapView* Modul (*modules/core/mapView.js*), in dem alle Scales definiert sind. Das *MapView* Modul stellt bereits über Backbone.Radio die Funktion *getScales* zur Verfügung, über die alle Scales abgefragt werden können.

### Aktuellen Kartenmaßstab abfragen und setzen
```js
define([
  "backbone",
  "backbone.radio"
], function (Backbone, Radio) {

    var Model = Backbone.Model.extend({
      initialize: function () {
        this.setScales(Radio.request("MapView", "getScales"));
        this.setCurrentScale(Radio.request("MapView", "getOptions").scale);
      },
      setScales: function (value) {...},
      setCurrentScale: function (value) {...}
    });

    return Model;
});
```

### Model Attribute ans Template übergeben
```js
define([
  "backbone",
  "underscore",
  "text!modules/scale/template.html",
  "jquery",
  "modules/scale/model"
], function (Backbone, _, ScaleTemplate, $, ScaleModel) {

    var View = Backbone.View.extend({
      ...
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
```js
define([
  ...
], function (...) {

    var View = Backbone.View.extend({
      ...
      template: _.template(ScaleTemplate),
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
```js
define([
  "backbone",
  "backbone.radio"
], function (Backbone, Radio) {

    var Model = Backbone.Model.extend({
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
define([
  "backbone",
  "backbone.radio"
], function (Backbone, Radio) {

    var Model = Backbone.Model.extend({
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
```js
define([
  "backbone",
  "backbone.radio"
], function (Backbone, Radio) {

    var Model = Backbone.Model.extend({
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
      setScales: function (value) {...},
      setCurrentScale: function (value) {...},
      getCurrentScale: function () {
        return this.get("currentScale");
      }
    });

    return Model;
});
```

### View Listener auf change currentScale im Model
```js
define([
  ...
], function (...) {

    var View = Backbone.View.extend({
      ...
      events: {...}
      initialize: function () {
        this.listenTo(this.model, {
            // Verändert sich der Maßstab der Karte,
            // wird die View neu gezeichnet.
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
