>Das Masterportal benötigt verschiedene Konfigurationsdateien, die auf diesen Seiten dokumentiert sind. Außerdem werden die verfügbaren URL-Parameter sowie die für das Master-Portal notwendigen Proxies beschrieben.   

[TOC]

#Konfigurationsdateien#
Das Masterportal baut auf globalen und portalspezifischen Konfigurationsdateien auf.

Globale Konfigurationsdateien. (Es macht Sinn, dass diese von allen Portalen gemeinsam genutzt werden): 

* [services.json](https://bitbucket.org/lgv-g12/lgv/wiki/services.json):  alle verfügbaren WMS-Layer und WFS-FeatureTypes
* [rest-services.json](https://bitbucket.org/lgv-g12/lgv/wiki/rest-services.json): URLs zu verschiedenen Diensten
* [style.json](https://bitbucket.org/lgv-g12/lgv/wiki/style.json): Style-Definitionen für WFS-FeatureTypes

Portalspezifische Konfigurationsdateien:  

* [config.js](https://bitbucket.org/lgv-g12/lgv/wiki/config.js): Konfiguration von Pfaden zu weiteren Konfigurationsdateien und zu nutzenden Diensten.
* [config.json](https://bitbucket.org/lgv-g12/lgv/wiki/config.json): Konfiguration der Portal-Oberfläche und der Inhalte.

Die folgende Abbildung zeigt schematisch das Zusammenspiel der Dateien. Wichtig ist, dass sich die Dateien index.html, [config.js](https://bitbucket.org/lgv-g12/lgv/wiki/config.js) und [config.json](https://bitbucket.org/lgv-g12/lgv/wiki/config.json) im selben Verzeichnis befinden.

![Konfig-Überblick.png](https://bitbucket.org/repo/88K5GB/images/4248626536-Konfig-%C3%9Cberblick.png)

#URL-Parameter#
Das Masterportal kann über [URL-Parameter](https://bitbucket.org/lgv-g12/lgv/wiki/URL-Parameter) aufgerufen werden. 

#Proxies#
Für das Abfragen von Attributinformationen (WMS GetFeatureInfo) oder für das Laden von WFS-Layern werden vom Masterportal [Proxies](https://bitbucket.org/lgv-g12/lgv/wiki/Proxies) vorausgesetzt.