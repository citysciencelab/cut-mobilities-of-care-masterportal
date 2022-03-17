# StoryTellingTool

## Configuration

The StoryTellingTool let's the user explore and create stories.

| Name               | Required | Type    | Default            | Description                                                                              |
| ------------------ | -------- | ------- | ------------------ | ---------------------------------------------------------------------------------------- |
| active             | no       | Boolean | false              | Whether the tool is initially opened or not.                                             |
| name               | no       | String  | Story Telling Tool | Name of the tool in the menu.                                                            |
| glyphicon          | no       | String  | glyphicon-book     | CSS class of the glyphicons, which is displayed before the name of the tool in the menu. |
| renderToWindow     | no       | Boolean | true               | Whether the tools is rendered in a separate window or not.                               |
| resizableWindow    | no       | Boolean | true               | Whether the tool window is resizeable or not.                                            |
| isVisibleInMenu    | no       | Boolean | true               | Whether the tool is visible in the menu or not.                                          |
| deactivateGFI      | no       | Boolean | false              | If set to `true`, the filter tool deactivates GFI requests while open.                   |
| initialWidth       | no       | Number  | 500                | The initial width of the tool.                                                           |
| initialWidthMobile | no       | Number  | 300                | The initial width of the tool on mobile devices.                                         |

**Example**

```json
"storyTellingTool": {
  "name": "Story Telling Tool",
  "glyphicon": "glyphicon-book"
}
```

## Explore your story

After creating your story in the creator section of the StoryTellingTool, you can download the story as zip file.
The zip file contains a `story.json` and, in case you added HTML content to your story, a `story` folder.

**Example**

story.zip content folder structure

```
story.zip
|-- story.json
|-- story
|    step_1-1.html
|    step_2-1.html
|    step_2-2.html
|   |-- images
|   |   |-- step_1-1_1.png
|   |   |-- step_1-1_2.jpg
```

To explore your story in the StoryTellingTool ...

1. place the content of the zip file in your portal config folder
2. add a `storyConf` parameter to the `Config` in your portal's `config.js` with the path to the `story.json` as value

**Example**

portal folder structure

```
masterportal/portal
|-- my_portal
|    config.js
|    config.json
|    index.html
|   |-- story.json
|   |-- story
|   |    step_1-1.html
|   |    step_2-1.html
|   |    step_2-2.html
|   |   |-- images
|   |   |   |-- step_1-1_1.png
|   |   |   |-- step_1-1_2.jpg
```

config.js

```js
const Config = {
  addons: ["storyTellingTool"],
  storyConf: "./story.json",
  [...]
};
```
