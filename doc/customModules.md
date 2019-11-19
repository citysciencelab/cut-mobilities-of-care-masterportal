Um eigene Entwicklungen in das MasterPortal zu integrieren existiert ein Mechanismus der es erlaubt, Code von außerhalb des MasterPortal-Repositories in die MasterPortal Sourcen zu integrieren. Siehe auch **[lokale Entwicklungsumgebung einrichten](setup-dev.md)**.


Um die externen Sourcen in der Entwicklungsumgebung und dem Dev-Server in das per WebPack erzeugte bundle zu integrieren, besteht in der Konsole über Eingabe eines weiteren Parameters die Möglichkeit hierzu. _CUSTOMMODULE_ wird als relativer Pfad zum JavaScript ausgehend von der _js/main.js_ angegeben.

```
# npm start -- --CUSTOMMODULE "[Pfad zum Custom Module]"
```

Der genutzte Mechanismus wird über **[webpackMode: eager](https://webpack.js.org/api/module-methods)** gesteuert,indem zur Kompilierzeit der Pfad im übergebenen Parameter importiert wird.
Dadurch wird das Model der externen Sourcen erst ganz zum Schluß initialisiert und ist in der Model-Liste nur rudimentär vorhanden und wird dort ausgetauscht.

Besonderheit:
Die View-Klasse der externen Sourcen muss das zugehörige Model neu anlegen. Dieses wird in der Model-Liste mit dem rudimentären Model ausgetauscht.



Beim build-Prozess per

```
# npm run build
```

wird der Pfad zum Custom Module ebenfalls abgefragt. Wird unter dem Pfad ein entsprechendes Modul gefunden wird dieses mit in das webpack-bundle geschrieben und ist in der gebauten App verfügbar.

Das Custom-Module selbst ist identisch wie ein natives Modul zu programmieren (siehe auch **[Tutorial 01: Ein neues Modul erstellen (Scale Switcher)](02_tutorial_new_module_scale_switcher.md)**). Es liegt lediglich außerhalb des Repos und erlaubt so eine getrennte Verwaltung.


# Neue Struktur (ab spätestens 2020)
Es gibt nun einen extra Ordner *"customModules"*, welcher unabhängig vom Portal saämtliche *CustomModules* enthält. Dieser ist ebenfalls ein eigenes Repository.

## Anpassen eines *CustomModules* an die aktuellen Anforderungen
Eine Nutzung der *CustomModule* aus *Portalconfigs* heraus ist **nicht möglich**. Derzeit sind noch nicht alle *CustomModule* von *Portalconfigs* hierher umgezogen. Falls also ein *CustomModule* benötigt ist, welches noch nicht hier liegt, müssen folgende Schritte unternommen werden:

1. Ordner mit dem gewünschten Namen erstellen

2. Alle Dateien, welche für das *CustomModule* benötigt werden, von *Portalconfigs* in den besagten Ordner hierher verschieben

3. Den Eintrag in der Datei **customModulesConf.json** ergänzen, so wie { "customModuleName": "entryPoint.js" }

4. Leere **doc.md** Datei für das *CustomModule* anlegen

5. In der Datei **index.html** des entsprechenden *CustomModules* in *Portalconfigs* die Pfade analog zu *flaecheninfo* und *verkehrsportal* ändern

6. In der Datei **config.js** des entsprechenden *CustomModules* in *Portalconfigs* den Eintrag für die gewünschten *CustomModules* anlegen, so wie { "customModules": ["flaecheninfo", "verkehrsportal"] }

## Nutzung der neuen Struktur
- Zum Starten des Servers reicht ein **npm start**
- Zum Exportieren des Portals reicht ein **npm run build**





