# README

## Description

This module is an alternative to the parcel search function offered in `searchbar/gaz`. Districts (by name and number) are listed in a select element. District data is maintained in the `gemarkung.json` file versioned in the `lgv-config` repository.

This search uses the StoredQuery with ID `Flurstueck`. The portal UI is located in the menu tool `Parcel search`.
## Configuration

```js
{
    "tools": {
        "parcelSearch": true,
        // ...
    },
    "gemarkungen": https://geodienste.hamburg.de/lgv-config/gemarkung.json",
    // ...
}
```
