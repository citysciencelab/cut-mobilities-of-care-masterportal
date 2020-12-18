#Readme
Die Searchbar erwartet ein Konfigurationsobjekt (siehe jsdoc), mit jeder Menge Parametern. Diese steuern in der view, welche Suchalgorythmen genutzt werden sollen. Die Searchbar required diese Module und dtartet sie. Jeder Suchalgorythmus ist in einem Modul unterhalb der Searchbar beheimatet und kommuniziert mit der searchbar nur über den Radio.
Auch das Zoomen auf Treffer erfolgt über den Radio und verbindet so den mapMarker.
Die Searchbar selbst kümmert sich nur um das Darstellen der Treffer, die die Suchalgorythmen herausfinden.
