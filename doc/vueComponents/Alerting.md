# The Alerting module

The Masterportal can display hints to users by using the *Alerting* module. Both simple texts and HTML may be displayed.

Since multiple alert messages may be shown at once, a pool of all available alerts exists. On adding a valid alert to this pool, a modal with all currently active alerts is shown.

An alert may be added in this fashion:

```js
import store from "[...]/src/app-store/index";

// [...]

store.dispatch("Alerting/addSingleAlert", {
    "category": "Error",
    "content": "This wasn't supposed to happen! (Error Code 1234)",
    "displayClass": "error"
});
```

Another example: The following alert is shown from October '20 to November '21 and requires a manual reading confirmation. Three months after confirmation, it will be shown again.

```js
import store from "[...]/src/app-store/index";

// [...]

store.dispatch("Alerting/addSingleAlert", {
    "category": "Info",
    "confirmText": "Starting any minute now ... !",
    "content": "Please prepare the quarterly reports!",
    "displayClass": "warning",
    "displayFrom": "2020-10-01 00:00:00",
    "displayUntil": "2021-11-01 00:00:00",
    "mustBeConfirmed": true,
    "once": {months: 3}
});
```

## Parameters for alert creation

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|category|no|String|"Info"|Header text and, at the same time, reference value for grouping alerts of the same *category*.|
|confirmText|no|String|"mark as read"|Text of a clickable link to indicate the alert has been read. Only required when `mustBeConfirmed` is set to `true`.|
|content|yes|String|""|Message. May contain HTML.|
|displayClass|no|String|"info"|Alert wrapper element CSS class. Available pre-defined values: `"info"`, `"warning"`, `"error"`|
|displayFrom|no|Boolean/String|false|Time from which the alert may be displayed. When set to `false`, no limitation is applied. Format: "YYYY-MM-DD HH-II-SS"|
|displayUntil|no|Boolean/String|false|Time to which the alert may be displayed. When set to `false`, no limitation is applied. Format: "YYYY-MM-DD HH-II-SS"|
|mustBeConfirmed|no|Boolean|false|Flag indicating whether the alert requires a manual read confirmation.|
|once|no|Boolean/Object|false|If `false`, this alert may be shown on each visit. If `true`, it's only shown once. You may also define an object indicating a time span after which the alert may be displayed again: `{"years": 1, "months": 3, "days": 5, "hours": 15, "minutes": 10, "seconds": 3, "milliseconds": 123}` (https://momentjs.com/docs/#/parsing/object/). All keys are optional.|

## Initially loading an *Alerting* configuration

The *Alerting* module allows specifying an URL in the `config.js` parameter `alerting.fetchBroadcastUrl`, e.g. `"https://localhost:9001/portal/master/resources/broadcastedPortalAlerts.json"`. If such a parameter is set, the module will load the linked configuration file and create the alerts. This may e.g. be used to inform users of new versions or planned down-times. An arbitrary amount of portals may be supplied with such a central user information file.

Configuration file example:

```json
{
  "globalAlerts": ["AlertId3"],

  "restrictedAlerts": {
    "https://myOfflinePortal.com/": ["AlertId1", "AlertId2"],
    "https://myLegacyPortal.com/": ["AlertId4"]
  },

  "alerts": {
    "AlertId1": {
      "displayClass": "error",
      "category": "Error",
      "content": "The server is in maintenance mode until November 10, 2020.",
      "displayFrom": "2020-11-09 00:00:00",
      "displayUntil": "2020-11-10 00:00:00",
      "mustBeConfirmed": false,
      "once": false
    },
    "AlertId2": {
      "displayClass": "info",
      "category": "Info",
      "content": "Since 11.11. there is a new version of the portal!",
      "displayFrom": "2020-11-11 00:00:00",
      "displayUntil": "2020-11-30 00:00:00",
      "mustBeConfirmed": true,
      "once": true
    },
    "AlertId3": {
      "displayClass": "info",
      "category": "Welcome!",
      "content": "Welcome to the Portal!",
      "once": {"years": 1}
    },
    "AlertId4": {
      "displayClass": "warning",
      "category": "Warning",
      "content": "This portal will be deactivated on 01/01/2021!",
      "displayFrom": "2020-12-01 00:00:00",
      "displayUntil": "2020-12-31 23:59:59",
      "once": {"days": 1}
    }
  }
}
```

Within `"globalAlerts"` an array may be specified that holds alert IDs to be loaded on all portals.

In the `"restrictedAlerts"` object alerts only for specific portals may be specified. For these, the key is the portal URL, and the value an array of alert IDs to be resolved by the portal at that URL.

Within `"alerts"`, alerts may be defined as previously defined. Each alert holds an ID for reference, which is its respective key in the `"alerts"` object.
