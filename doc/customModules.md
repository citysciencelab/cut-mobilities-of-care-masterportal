# Addons #

Um eigene Entwicklungen in das MasterPortal zu integrieren existiert ein Mechanismus der es erlaubt, Code von außerhalb des MasterPortal-Repositories in die MasterPortal Sourcen zu integrieren. Siehe auch **[lokale Entwicklungsumgebung einrichten](setup-dev.md)**.

Dadurch werden die Models der externen Sourcen erst ganz zum Schluß initialisiert. Es wird temporär ein Platzhalter-Model in der Model-List angelegt.

Die View-Klasse der externen Sourcen muss das zugehörige Model neu anlegen. Dieses wird dann in der Model-Liste mit dem Platzhalter-Model ausgetauscht.

Das Addon selbst ist identisch wie ein natives Modul zu programmieren (siehe auch **[Tutorial 01: Ein neues Modul erstellen (Scale Switcher)](02_tutorial_new_module_scale_switcher.md)**). Es liegt lediglich außerhalb des Repos und erlaubt so eine getrennte Verwaltung.

Diese Addons liegen in einem Ordner namens "addons" auf Root-Ebene des Masterportals.
