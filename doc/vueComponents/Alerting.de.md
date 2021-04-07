# Das Alerting Modul #

Hinweise an den User können im Masterportal mithilfe des Moduls "Alerting" angezeigt werden. Einfache Texte und auch HTML können angezeigt werden.

Da mehrere Alerts gleichzeitig angezeigt werden können, existiert ein Pool mit vorhandenen Alerts. Wird diesem Pool ein valides Alert hinzugefügt, erscheint ein Modal mit allen aktuellen Alerts.

Ein Alert kann wie folgt hinzugefügt werden:

```
import store from "[...]/src/app-store/index";

// [...]

store.dispatch("Alerting/addSingleAlert", {
    "category": "Fehler",
    "content": "Das hätte nicht passieren dürfen! (Fehlercode 1234)",
    "displayClass": "error"
});

```

Hier ein weiteres Beispiel: Folgendes Alert wird im Zeitraum von Oktober 2020 bis November 2021 angezeigt und bedarf einer manuellen Lesebestätigung. Weiterhin wird es nach dem Ablaufen von 3 Monaten nach der Lesebestätigung erneut angezeigt.

```
import store from "[...]/src/app-store/index";

// [...]

store.dispatch("Alerting/addSingleAlert", {
    "category": "Info",
    "confirmText": "OK, ich fange jetzt gleich an!",
    "content": "Bitte erstellen Sie die Quartalsberichte!",
    "displayClass": "warning",
    "displayFrom": "2020-10-01 00:00:00",
    "displayUntil": "2021-11-01 00:00:00",
    "mustBeConfirmed": true,
    "once": {months: 3}
});

```

## Parameter beim Erstellen eines Alerts ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|category|nein|String|"Info"|Überschrift und gleichzeitig Referenzwert zum Gruppieren von Alerts gleicher "category".|
|confirmText|nein|String|"als gelesen markieren"|Text des klickbaren Links, mit dem man das Alert zur Kenntnis nimmt. Nur nötig, wenn "mustBeConfirmed" true ist.|
|content|ja|String|""|Botschaft. Kann auch HTML beinhalten.|
|displayClass|nein|String|"info"|CSS Klasse für das Wrapper-Element des Alerts. Derzeit vorgefertigte Werte: "info", "warning", "error"|
|displayFrom|nein|Boolean/String|false|Zeitpunkt, ab dem das Alert angezeigt werden darf. Bei false gibt es keine Begrenzung. Format: "YYYY-MM-DD HH-II-SS"|
|displayUntil|nein|Boolean/String|false|Zeitpunkt, bis wann das Alert angezeigt werden darf. Bei false gibt es keine Begrenzung. Format: "YYYY-MM-DD HH-II-SS"|
|mustBeConfirmed|nein|Boolean|false|Flag, ob das Alert eine manuelle Lesebestätigung enthält|
|once|nein|Boolean/Object|false|Wenn false, kann dieses Alert immer wieder angezeigt werden. Wenn true, wird es nur einmal angezeigt. Es kann auch ein Objekt mit einer Zeitspanne angelegt werden, in der das Alerting nicht erneut angezeigt werden kann: {years: 1, months: 3, days: 5, hours: 15, minutes: 10, seconds: 3, milliseconds: 123} (https://momentjs.com/docs/#/parsing/object/). Die einzelnen Keys sind optional.|

## Initiales Laden einer Alerting Konfiguration ##
Das Alerting Modul bietet die Möglichkeit, in der Datei config.js eine URL unter dem Parameter alerting.fetchBroadcastUrl zu definieren, zum Beispiel "https://localhost:9001/portal/master/resources/broadcastedPortalAlerts.json". Falls geschehen, lädt das Portal beim Starten die dort hinterlegte Konfigurationsdatei und erstellt Alerts. Das ist hilfreich, wenn man beispielsweise die Nutzer eines Portals auf eine neue Version hinweisen möchte oder eine Serverwartung geplant ist. Somit können bei beliebig vielen Portalen zentral Userhinweise konfiguriert werden.

Beispiel einer Konfigurationsdatei:

```
{
  "globalAlerts": ["AlertId3"],

  "restrictedAlerts": {
    "https://myOfflinePortal.com/": ["AlertId1", "AlertId2"],
    "https://myLegacyPortal.com/": ["AlertId4"]
  },

  "alerts": {
    "AlertId1": {
      "displayClass": "error",
      "category": "Fehler",
      "content": "Der Server befinden sich bis zum 10.11.2020 im Wartungsmodus.",
      "displayFrom": "2020-11-09 00:00:00",
      "displayUntil": "2020-11-10 00:00:00",
      "mustBeConfirmed": false,
      "once": false
    },
    "AlertId2": {
      "displayClass": "info",
      "category": "Info",
      "content": "Seit dem 11.11. gibt es eine neue Version des Portals!",
      "displayFrom": "2020-11-11 00:00:00",
      "displayUntil": "2020-11-30 00:00:00",
      "mustBeConfirmed": true,
      "once": true
    },
    "AlertId3": {
      "displayClass": "info",
      "category": "Willkommen!",
      "content": "Willkommen im Portal!",
      "once": {"years": 1}
    },
    "AlertId4": {
      "displayClass": "warning",
      "category": "Achtung",
      "content": "Dieses Portal wird am 01.01.2021 deaktiviert!",
      "displayFrom": "2020-12-01 00:00:00",
      "displayUntil": "2020-12-31 23:59:59",
      "once": {"days": 1}
    }
  }
}

```

Unter "globalAlerts" kann ein Array definiert werden, welcher alle Alert IDs beinhaltet, welche auf allen Portalen geladen werden sollen.

Unter "restrictedAlerts" wird ein Objekt definiert, womit bestimmten Portalen bestimmte Alerts zugewiesen werden können. Hierbei ist der Key die URL des jeweiligen Portals und der Value ein Array bestehend aus den ALert IDs.

Unter "alerts" werden nun wie oben die Alerts definiert. Zum Referenzieren erhält jedes Alert eine ID, welche gleichzeitig dessen Key im "alerts" Objekt ist.
