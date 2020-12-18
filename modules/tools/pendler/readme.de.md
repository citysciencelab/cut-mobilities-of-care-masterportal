#Readme
Dieses Tool dient zunächst zur Darstellung von Pendler-Zahlen entweder als Animation oder als Linien-Diagramm. Dabei wird für
beide Darstellungsarten ein eigenes Tool ("animation" bzw. "lines") zur Verfügung gestellt, die unabhängig voneinander verwendet werden können.

Der Code, der von beiden Werkzeugen verwendet wird (dies sind vor allem die Funktionen zum Abfragen des WFS), ist in core/model.js zu finden. Beide Werkezuge erben von diesem Model.

Grundsätzlich können die Werkzeuge auch zur Darstellung anderer Daten (dh. keiner Pendler-Zahlen) verwendet werden, da die auszuwertenden Parameter (Attribute) sowie die Sever-URL über die Konfigurationsdatei config.json bestimmt werden.
