# Changelog LGV Master-Portal 1.2.1

FIXES:

  - 00917df Portal-Titel wurde in "kleinen" Themenportalen initial nicht angezeigt

# Changelog LGV Master-Portal 1.2.0

NEU:

  - c1ad7b6 Bei der Animation wird auf die Gemeinde gezoomt und ein Marker auf der karte gesetzt
  - 0932b5d Legende für Pendler-Animation in der Werkzeug-Oberfläche implementiert
  - f8d8e61 Unterstützung von setElement() für parcelSearch
  - 0551722 GFIs können in Tabellenform dargestellt werden
  - 97517de Bei der Animation werden dei Punkte anhängig von Pendlerdanzahl und Landkreis dargestellt
  - 90be2d3 Themenbaum kann in kleinen Themenportalen initial aufgeklappt werden

FIXES:

  - d466fb5 keinStartupModul in URL möglich
  - d32423e KML Import Problem im Internet-Explorer
  - b44b62c länge Portaltitel - Die Länge des Portaltitels passt sich an verfügbaren Platz in der Menüleiste an
  - e903ba5 lighttree Sortierung - In kleinen Themenportalen entsprach die Reihenfolge im Themenbaum nicht der Reihenfolge auf der Karte
  - 9522f0c Messen Label - Durch das Verändern der Einheit beim Messen (km/km² in m/m² und umgekehrt), wurde der Messwert der zuletzt gezeichneten Strecke/Fläche entsprechenden umgerechnet
  - ef49ad2 mobile Legende - Beim Wechsel der Anwendungssicht (desktop <=> mobil) wurde die Legende nicht mehr angezeigt.
  - fb24d98 werden Layer im Portal parametrisiert aufgerufen, wurden die entsprechenden Layer zwar im Baum selektiert, aber nicht auf der Karte angezeigt
  - 3d9a209 im IE wurde GFI wegen Overflow-y (css) nicht korrekt dargestellt.
  - ac48f29 BackgroundSwitch-Button nur sichtbar, wenn auch konfiguriert
  - b945614 Mobil wurde das Routingmodul nicht initial geladen.
  - de4a32e fix quickhelp Fehler in console und quickhelp-Button neben searchbar wurde nicht angezeigt
  - 7eadc7f verkehrsfunction Util Fehler
  - 893c2c6 Quickhelp wird in einem starren Fenster gerendered
  - 95ff542 Breite des GFI-Popup von 50% auf 25% der Bildschirmhälfte gesetzt
  - 1f2f810 Beim Messen wird wieder das Tooltip angezeigt
  - f90f787 Suche springt während des Tippens nicht mehr automatisch auf eine gefundene Adresse oder Thema
  - ea888a8 hintergrundkarten werden bei themensuche immer eingeklappt, auch wenn sie ausgeklappt waren
  - 4b135db controls in config.json werden auch auf true/false geprüft
  - 32f0022 Routenplaner verwendet den richtigen Routing-Dienst
  - b6ea8d3 "in meiner Nähe" - Attribute nicht mehr doppelt
  - b12c6d5 portallogo configurierbar

# Changelog LGV Master-Portal 1.1.6

FIXES:
  - 97ad0aa csw falsches Datum ausgelesen, da erneut über ganze csw Datei gesucht wurde
  - 59fae85 Parameter &LAYERIDS in URL wurden nicht mit SimpleTree ausgewertet. &CLICKCOUNTER jetzt überflüssig.

# Changelog LGV Master-Portal 1.1.5

FIXES:

  - 658d016 startcenter wurde nicht ausgelesen aus config.json

# Changelog LGV Master-Portal 1.1.4

FIXES:

  - 11e3138 Die Reihenfolge der Themen auf der Karte entsprach nicht immer der korrekten Reihenfolge der Themen in der Auswahl

# Changelog LGV Master-Portal 1.1.3

FIXES:

  - c05d205 Zeichnungen werden nicht gedruckt

# Changelog LGV Master-Portal 1.1.2

FIXES:

  - a27eb17 gfi Attribute werden nur noch nach Datum formatiert wenn sie ISO 8601 entsprechen

# Changelog LGV Master-Portal 1.1.1

FIXES:

  - b759d17 Auswahl speichern - Beim Öffnen einer gespeicherten Auswahl wurden immer alle Layer auf der Karte angezeigt, unabhängig davon ob der Layer sichtbar war oder nicht.

# Changelog LGV Master-Portal 1.1.0

NEU:

  - 32964b6 Style WMS - Layer können jetzt im Client neu gestylt werden. Vorläufige Einschränkung: Nur mit Flächengeometrien im Zusammenspiel mit SLD v1.0.0 möglich
  - 6f0dff6 kml import tool zugefügt
  - d448742 Navigation für mobile Endgeraete bzw. fuer Bildschirmbreiten bis zu 768px komplett ueberarbeitet (Design und Usability)
  - 2b8bb1b custom js für bauinfo

FIXES:

  - 06935f3 Legende wird im Infofenster erst angezeigt wenn der Layer sichtbar ist
  - df8d671 Measure- und Zeichenlayer immer an oberster Stelle
  - 9639ab9 maxscale initial ignoriert
  - 698594f WFS-Layer können verschiedene Styles zugewiesen werden
  - 582de4c Searchbar springt nicht mehr aus der Menüleiste
  - 7e3d0fe Searchbar springt nicht mehr aus der Menueleiste
  - 176d2bf GFI Abfrage funktioniert jetzt auch bei extern hinzugefügten WMS-Layern
  - 07aeee9 Das Kontaktformular wird direkt bei der Texteingabe validiert.
  - bb1fb95 initiale Strassensuche auch mit " " und "-" möglich
  - baf3f4e Lokalisierung in Chrome ist nur noch von HTTPS möglich
  - ffc0bcc drucken von KML-Features möglich
  - 4304704 GFI-Reihenfolge wird in der richtigen Reihenfolge dargestellt
  - faa9133 GFIPopup hat eine maximale Höhe in Relation zur Fensterhöhe
