# Addons #

Um eigene Entwicklungen in das MasterPortal zu integrieren existiert ein Mechanismus der es erlaubt, Code von außerhalb des MasterPortal-Repositories in die MasterPortal Sourcen zu integrieren. Siehe auch **[lokale Entwicklungsumgebung einrichten](setup-dev.md)**.

Dadurch werden die Models der externen Sourcen erst ganz zum Schluß initialisiert. Es wird temporär ein Platzhalter-Model in der Model-List angelegt.

Die View-Klasse der externen Sourcen muss das zugehörige Model neu anlegen. Dieses wird dann in der Model-Liste mit dem Platzhalter-Model ausgetauscht.

Das Addon selbst ist identisch wie ein natives Modul zu programmieren (siehe auch **[Tutorial 01: Ein neues Modul erstellen (Scale Switcher)](02_tutorial_new_module_scale_switcher.md)**). Es liegt lediglich außerhalb des Repos und erlaubt so eine getrennte Verwaltung.

Diese Addons liegen in einem Ordner namens "addons" auf Root-Ebene des Masterportals.

Folgende Struktur ist dabei zu beachten:

## Dateistruktur von Addons ##

1. Jedes *Addon* liegt in einem eigenen Ordner, welcher so heißt, wie in **addonsConf.json** als key definiert. In diesen Ordnern liegen alle für die jeweiligen *Addons* benötigten Dateien einschließlich der **doc.md** Dateien.

#### Beispiel entsprechende Ordnerstruktur ####
```
myMasterPortalFolder/
    addons/
        myAddon1/
            loader.js
            anotherFile.js
            doc.md
            [...]
        myAddon2/
            subFolder/
                init.js
                [...]
            doc.md
            anotherFile.js
            [...]
    devtools/
    doc/
    [...]
```

2. Direkt in dem Ordner muss die Konfigurationsdatei **addonsConf.json** liegen. Diese beinhaltet einen JSON bestehend aus den Namen der *Addons* als Keys und die vom *addons/[key]* Ordner aus relativen Pfade zu deren *Entrypoints* als Values. Das nachfolgende Beispiel basiert auf die oben beschriebene beispielhafte Ordnerstruktur.

#### Beispiel **addonsConf.json** ####
```
{
  "exampleAddon": "entrypoint.js",
  "myAddon1": "loader.js",
  "myAddon2": "subFolder/init.js"
}
```

3. Es sollten hier ausschließlich nur die Dateien landen, welche zu *addons* gehören.

## Beispiel-Addon ##

Hier legen wir kurz ein Beispiel-Addon an!

1. Dateien Erstellen: Das Beispiel-Addon trägt den Namen *exampleAddon* und seine Enrypoint-Datei heißt *entrypoint.js*. Daraus ergibt sich eine Dateistruktur wie folgt:

```
myMasterPortalFolder/
    addons/
        exampleAddon/
            entrypoint.js
    devtools/
    doc/
    [...]
```

2. Addon-Code schreiben:

```
// myMasterPortalFolder/addons/exampleAddon/entrypoint.js

const exampleAddon = Backbone.Model.extend({
    defaults: {},

    initialize: function () {
        console.warn("Hello. I am an addon.");
    }
});

export default exampleAddon;
```
Das Model muss folgende properties haben:
```
type: "tool",
id: "exampleId", // muss gleich dem Schlüssel unter tools in der config.json sein
name: "Example Tool", 
glyphicon: "glyphicon-example"
```

3. Die Addons-Config-Datei erstellen:

```
// myMasterPortalFolder/addons/addonsConf.json

{
  "exampleAddon": "entrypoint.js"
}
```

4. Das Beispiel-Addon in der config.js Datei des Portals aktivieren:
```
// myMasterPortalFolder/config.js

const Config = {
    // [...]
    addons: ["boris"],
    // [...]
};
```



