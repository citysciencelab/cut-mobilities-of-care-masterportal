# Readme

Die Searchbar erwartet ein Konfigurationsobjekt (siehe jsdoc) mit jeder Menge Parametern.

Diese steuern in der view, welche Suchalgorithmen genutzt werden sollen. Die Searchbar required diese Module und startet sie. Jeder Suchalgorithmus ist in einem Modul unterhalb der Searchbar beheimatet und kommuniziert mit der searchbar nur über das Radio.

Auch das Zoomen auf Treffer erfolgt über das Radio und bindet so den mapMarker an.

Die Searchbar selbst kümmert sich nur um das Darstellen der Treffer, die die Suchalgorithmen herausfinden.
