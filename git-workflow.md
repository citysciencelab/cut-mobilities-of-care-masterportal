>Unser git-Workflow.

## Commit
* Committe früh und oft
* Ein Commit repräsentiert eine Idee oder eine Änderung
* Nutze Verben für die Commits **(add/remove/update/refactor/fix/config/hotfix)**
* Es dürfen keine console.log Statements in den Commits vorhanden sein
* Die einzigen zugelassen Commits auf dem stable-Branch sind "hotfix-Commits". hotfix-Commits werden sowohl in den stable als auch in den dev-Branch gemerged, d.h. 1 Feature-Branch, 2 Pull Requests.

## Branches und Workflow
* Die Entwicklung neuer Features und das BugFixing erfolgt in der Regel auf Feature Branches ausgehend vom dev-Branch. Wir setzen den [Gitflow Worklflow](https://www.atlassian.com/git/tutorials/comparing-workflows#gitflow-workflow) ein.
* der Entwicklungsbranch heißt **dev**, der stabile Branch **stable**.
* Bezeichnung der Branches: 43_add_GFI oder 56_update_draw (IssueNummer_Verb_Modul)
* Die Nummer des Issues ergibt sich aus der Nummmer der Karte im Trello Board. Um diese anzuzeigen, gibt es diese [Erweiterung für Chrome](https://chrome.google.com/webstore/detail/trello-card-numbers/kadpkdielickimifpinkknemjdipghaf).
* Nutze Verben für die Merge-Commits **(add/remove/update/refactor/fix/config/hotfix)**. Die Merging-Commit-Messages sollen deutsch und sprechend sein. Die "add"- und "fix"-Messages der Merges fließen bei neuen Stable-Versionen in die CHANGELOG.md! "hotfix"-Messages fließen ebenso in die CHANGELOG.md, wenn minor-updates gemacht werden.
* Branches werden nach dem Mergen gelöscht

## Pushen
* Die Commits werden mit thematisch umschließenden Pushes ins Repository geschrieben, wobei es nicht Ziel ist, ganze Features in einem Push zu umschließen, sondern Tätigkeiten. Mit der lokalen Entwicklungsumgebung ist eine tägliche Sicherung ins Repository empfehlenswert um Datenverlust zu verhindern.

## Pull Requests
* Die in Branches abgelegten Commits werden vor dem Mergen als Pull Request dem restlichen Team zum Review angeboten. Der Entwickler prüft vor dem Stellen des Pull Requests diese Punkte:
    - der Ziel-Branch wurde unmittelbar vor dem Stellen des Pull Requests in den Feature-Branch gemerged
    - der Code ist OK
        - Es gibt keine Linter-Meldungen
        - der Code folgt unseren [Konventionen](conventions.md)
    - die Dokumentation wurde erweitert
        - [Anwender-Dokumentation](doc.md)
        - [Entwickler-Dokumentation](doc/remoteinterface.md)
    - Testfälle/Tests liegen vor
        - bei neuen Funktionen: kurze Beschreibung eines Testfalls zur Aufnahme ins Testprotokoll (sollte sich aus dem Ticket ergeben)
        - Unit Tests sind erstellt
    - funktionaler Test in gebauter Version
        - gemäß der Beschreibung im Ticket
        - Cross-Browser (Chrome, IE 11, FF) - mobiles Verhalten im Browser emuliert

* Im Review durch mind. 1 Team-Mitglied werden diese Punkte ebenfalls geprüft. Fehler oder Kommentare können dann direkt im Code oder im Pull Request hinterlegt werden. Ist der Pull Request OK, wird er approved und in den Ziel-Branch gemerged.

* **externe Entwickler** ohne Schreibzugriff auf dieses Repository erstellen über Bitbucket einen [Fork](https://bitbucket.org/lgv-g12/lgv/fork) ausgehend vom dev-Branch. Pull Requests an dieses Repository können von dort ebenso gestellt werden.
