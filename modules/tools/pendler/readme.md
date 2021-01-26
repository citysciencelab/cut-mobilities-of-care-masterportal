# Readme

This tool is used to display commute numbers either as animation or line diagram. Both display types are offered as separate tools (`animation` and `lines`) for independent usage.

Code shared by both modules (especially WFS request functionality) is found in `core/model.js`. Both modules inherit from this model.

The tool may also be used to display other data (that is, not commute-related data) since the interpreted parameters (attributes) and server URL can be configured in the `config.json` file.
