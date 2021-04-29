# The ConfirmAction module

A simple modal dialog asking the user to confirm an action or make a decision. Callback functions can be defined for confirmation, rejection, and closing the modal dialog.

A confirmation action may be added in this fashion:

```js
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
        textContent: "Do you want to delete this important document?",
        denyCaption: "Deny",
        forceClickToClose: true,
        headline: "Warning"
    };

store.dispatch("ConfirmAction/addSingleAction", confirmActionSettings);

```

## Parameters used to create a ConfirmAction

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|actionConfirmedCallback|no|Function|false|Callback function fired on clicking the confirmation button.|
|actionDeniedCallback|no|Function|false|Callback function fired on clocking the deny button.|
|confirmCaption|no|String|"common:modules.confirmAction.defaultConfirmCaption"|Confirm button text.|
|textContent|no|String|"common:modules.confirmAction.defaultCopy"|Display text describing the situation to be resolved.|
|denyCaption|no|String|"common:modules.confirmAction.defaultDenyCaption"|Deny button text.|
|forceClickToClose|no|Boolean|true|Flag indicating whether the modal dialog may only be closed on clicking the X button.|
|headline|no|String|"common:modules.confirmAction.defaultHeadline"|Header text.|
