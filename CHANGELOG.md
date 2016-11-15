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
