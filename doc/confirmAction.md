# Das Confirm Action Modul #

Ein einfaches Modal, welches die Möglichkeit bietet, den User um Bestätigung einer Aktion oder um eine Entscheidung zu bitten. Für jeweils Zustimmung, Ablehnung oder das Schließen des Modals können Callback Funktionen definiert werden.

Eine Confirm Action kann wie folgt hinzugefügt werden:

```
import store from "[...]/src/app-store/index";

// [...]

const
    confirmCallback = function () {
        console.log("Confirmed");
    },
    denyCallback = function () {
        console.log("Denied");
    },
    escapeCallback = function () {
        console.log("Escaped");
    },
    confirmActionSettings = {
        actionConfirmedCallback: confirmCallback,
        actionDeniedCallback: denyCallback,
        actionEscapedCallback: escapeCallback,
        confirmCaption: "OK",
        textContent: "Wollen Sie dieses wichtige Dokument wirklich löschen?",
        denyCaption: "Abbrechen",
        forceClickToClose: true,
        headline: "Achtung"
    };

store.dispatch("ConfirmAction/addSingleAction", confirmActionSettings);

```

## Parameter beim Erstellen einer Confirm Action ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|actionConfirmedCallback|nein|Function|false|Callback Funktion, welche bei Click auf den Confirm Button ausgeführt wird.|
|actionDeniedCallback|nein|Function|false|Callback Funktion, welche bei Click auf den Deny Button ausgeführt wird.|
|confirmCaption|nein|String|"common:modules.confirmAction.defaultConfirmCaption"|Beschriftung des Confirm Buttons.|
|textContent|nein|String|"common:modules.confirmAction.defaultCopy"|Angezeigter Text.|
|denyCaption|nein|String|"common:modules.confirmAction.defaultDenyCaption"|Beschriftung des Deny Buttons.|
|forceClickToClose|nein|Boolean|true|Flag, ob das Modal nur durch Click auf das X geschlossen werden kann.|
|headline|nein|String|"common:modules.confirmAction.defaultHeadline"|Headline.|
