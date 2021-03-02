>Unser git-Workflow.

[TOC]

## Commit
* Committe früh und oft
* Ein Commit repräsentiert eine Idee oder eine Änderung
* Nutze Verben für die Commits **(add/remove/update/refactor/fix/config/hotfix)**
* Es dürfen keine console.log Statements in den Commits vorhanden sein

## Branches und Workflow
* Die Entwicklung neuer Features und das BugFixing erfolgt in der Regel auf Feature Branches ausgehend vom dev-Branch. Wir setzen den **[Gitflow Worklflow](https://www.atlassian.com/git/tutorials/comparing-workflows#gitflow-workflow)** ein.
* der Entwicklungsbranch heißt **dev**.
* Nutze Verben für die Merge-Commits **(add/remove/update/refactor/fix/config/hotfix)**. Die Merging-Commit-Messages sollen englisch und sprechend sein.
* Branches werden nach dem Mergen gelöscht

## Pushen
* Die Commits werden mit thematisch umschließenden Pushes ins Repository geschrieben, wobei es nicht Ziel ist, ganze Features in einem Push zu umschließen, sondern Tätigkeiten. Mit der lokalen Entwicklungsumgebung ist eine tägliche Sicherung ins Repository empfehlenswert um Datenverlust zu verhindern.

## Definition Of Done
* Der Author prüft vor dem Stellen eines Pull Request diese Punkte:
    - der Ziel-Branch wurde unmittelbar vor dem Stellen des Pull Requests in den Feature-Branch gemerged. Es bestehen daher keine Merge-Konflikte.
    - der Code ist OK
        - Es gibt keine Linter-Meldungen
        - der Code folgt unseren **[Konventionen](codingConventions.de.md)**
    - die Dokumentation wurde erweitert
        - **[Anwender-Dokumentation](doc.de.md)**
        - **[Entwickler-Dokumentation](remoteInterface.de.md)**
    - Testfälle/Tests liegen vor
        - bei neuen Funktionen: kurze Beschreibung eines Testfalls zur Aufnahme ins Testprotokoll (sollte sich aus dem Ticket ergeben)
        - Unit Tests sind erstellt: **[Test-Dokumentation](testing.de.md)**
    - funktionaler Test in gebauter Version
        - gemäß der Beschreibung im Ticket
        - Cross-Browser (Chrome, IE 11, FF) - mobiles Verhalten im Browser emuliert

## Forks
* **Externe Entwickler** sind keine Team-Mitglieder und haben daher keine Schreibberechtigungen im Repository. Sie erstellen bitte einen **[Fork](https://bitbucket.org/geowerkstatt-hamburg/masterportal/fork)** ausgehend vom **dev-Branch**.
* In diesem werden die Commits vorgenommen und von diesem können Pull Requests in den **dev-Branch** gestellt werden.
* Auch Bugs werden bitte im **dev-Branch** gefixt.
    - Im Pull Request soll bitte ein entsprechender Hinweis kenntlich machen, wenn der Bug als Hotfix veröffentlicht werden soll. Siehe auch **[Hinweise zur Versionierung](versioning.de.md)**.
    - Die Überführung übernehmen Team-Mitglieder.
    - Wir nutzen das **[Cherry Picking](https://git-scm.com/docs/git-cherry-pick)**, um die hotfix-Commits zu überführen. Dies gelingt am einfachsten, wenn die Commits nur den Hotfix enthalten. Siehe auch die **[Code-Konventionen](codingConventions.de.md)**.

## Pull Requests
* Die in Branches abgelegten Commits gelangen nur über Pull Requests im **dev-Branch**.
* **Externe Entwickler** stellen als Reviewer bitte den User **[geowerkstatt](https://bitbucket.org/geowerkstatt)** ein. Dieser Systemuser unterrichtet dann ein Teammitglied.
* Die Review erfolgt durch mind. 1 Team-Mitglied. Der Reviewer prüft den Pull Request anhand der Definition of Done. Fehler oder Kommentare können dann direkt im Code oder im Pull Request hinterlegt werden.
* Ist der Pull Request OK, wird approved. Für **externe Entwickler** übernimmt das approvende Teammitglied das mergen.
