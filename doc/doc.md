>Das Masterportal benötigt verschiedene Konfigurationsdateien, die auf diesen Seiten dokumentiert sind. Außerdem werden die verfügbaren URL-Parameter sowie die für das Master-Portal notwendigen Proxies beschrieben.

[TOC]

# Konfigurationsdateien #
Das Masterportal baut auf globalen und portalspezifischen Konfigurationsdateien auf.

Globale Konfigurationsdateien. (Es macht Sinn, dass diese von allen Portalen gemeinsam genutzt werden):

* [services.json](services.json.md):  alle verfügbaren WMS-Layer und WFS-FeatureTypes
* [rest-services.json](rest-services.json.md): URLs zu verschiedenen Diensten
* [style.json](style.json.md): Style-Definitionen für WFS-FeatureTypes

Portalspezifische Konfigurationsdateien:

* [config.js](config.js.md): Konfiguration von Pfaden zu weiteren Konfigurationsdateien und zu nutzenden Diensten.
* [config.json](config.json.md): Konfiguration der Portal-Oberfläche und der Inhalte.

Die folgende Abbildung zeigt schematisch das Zusammenspiel der Dateien. Wichtig ist, dass sich die Dateien index.html, [config.js](config.js.md) und [config.json](config.json.md) im selben Verzeichnis befinden.

![Konfig-Überblick.png](https://bitbucket.org/repo/88K5GB/images/4248626536-Konfig-%C3%9Cberblick.png)

# URL-Parameter #
Das Masterportal kann über [URL-Parameter](URL-Parameter.md) aufgerufen werden.

# Proxies #
Für das Abfragen von Attributinformationen (WMS GetFeatureInfo) oder für das Laden von WFS-Layern werden vom Masterportal [Proxies](proxies.md) vorausgesetzt.
