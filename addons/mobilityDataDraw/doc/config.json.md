# MobilityDataDraw

## Configuration

The MobilityDataDraw tool lets the user draw mobility routes on the map and add further information to the drawn routes.

| Name               | Required | Type    | Default                  | Description                                                                              |
| ------------------ | -------- | ------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| active             | no       | Boolean | false                    | Whether the tool is initially opened or not.                                             |
| name               | no       | String  | Mobilitätsdaten zeichnen | Name of the tool in the menu.                                                            |
| glyphicon          | no       | String  | glyphicon-pencil         | CSS class of the glyphicons, which is displayed before the name of the tool in the menu. |
| renderToWindow     | no       | Boolean | false                    | Whether the tools is rendered in a separate window or not.                               |
| resizableWindow    | no       | Boolean | true                     | Whether the tool window is resizeable or not.                                            |
| isVisibleInMenu    | no       | Boolean | true                     | Whether the tool is visible in the menu or not.                                          |
| deactivateGFI      | no       | Boolean | false                    | If set to `true`, the filter tool deactivates GFI requests while open.                   |
| initialWidth       | no       | Number  | 500                      | The initial width of the tool.                                                           |
| initialWidthMobile | no       | Number  | 300                      | The initial width of the tool on mobile devices.                                         |

**Example**

```json
"mobilityDataDraw": {
  "name": "Draw Mobility Data",
  "glyphicon": "glyphicon-map"
}
```

---
