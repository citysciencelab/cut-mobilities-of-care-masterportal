**9. Abwärts-Kompatibilität**

9.1. Stelle sicher, dass alle bisherigen Konfigurationsparameter weiterhin verwendbar sind.

9.2 Bei Veränderung/Refactoring/Löschen eines Parameters:
* Markiere den Parameter in der Doku mit "Deprecated in [nächstes Major-Release]".

Beispiel des deprecated Parameters "Baumtyp" in der config.json.md:

```markdown
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|Baumtyp|nein|enum["light", "default", "custom"]|"light"|Deprecated in 3.0.0 Bitte Attribut "treeType" verwenden.|false|
```

* Markiere den Code für den alten Parameter mit "@deprecated in [nächstes Major-Release]" im JSDoc.

Beispiel des deprecated Parameter "Baumtyp" im Code:
```javascript
/**
* this.updateTreeType
* @deprecated in 3.0.0
*/
attributes = this.updateTreeType(attributes, response);
...
/**
     * Update the preparsed treeType from attributes to be downward compatible.
     * @param {Object} attributes Preparased portalconfig attributes.
     * @param {Object} response  Config from config.json.
     * @returns {Object} - Attributes with mapped treeType
     * @deprecated in 3.0.0. Remove whole function and call!
     */
    updateTreeType: function (attributes, response) {
        if (_.has(response.Portalconfig, "treeType")) {
            attributes.treeType = response.Portalconfig.treeType;
        }
        else if (_.has(response.Portalconfig, "Baumtyp")) {
            attributes.treeType = response.Portalconfig.Baumtyp;
            console.warn("Attribute 'Baumtyp' is deprecated. Please use 'treeType' instead.");
        }
        else {
            attributes.treeType = "light";
        }
        return attributes;
    },
```

