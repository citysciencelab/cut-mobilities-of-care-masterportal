# README

## Description

All tools appearing in the menu "tools" are located in this folder. Entries are maintained in a list. Each list entry has a title, a glyphicon, and an active state (default: `false`). All attributes are optional and controlled in the `config.js` file. The order of tools in the configuration file determines the order of tools in the portal UI.

### List of available tools

* parcelSearch (Parcel search)
* gfi (GetFeatureInfo)
* coord (Coordinate request)
* print (Printing)
* measure (Measuring)
* draw (Drawing)
* record (WFS-T)

## Configuration

```js
{
    "tools": {
        "parcelSearch": {
            "title": "Parcel search",
            "glyphicon": "glyphicon-search"
        },
        "gfi": {
            "title": "Request information",
            "glyphicon": "glyphicon-info-sign",
            "isActive": true
        },
        "coord": {},
        // ...
    }
}
```
