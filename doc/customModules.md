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
