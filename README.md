## Mobilities of care
### City Science Lab - Connected Urban Twin

---
Care workers have specific demands on urban (transport) infrastructure
due to fragmented mobility patterns, which are not sufficiently addressed
by current urban development and are underrepresented in planning and participation
processes. The tools in this repository are two add-ons for the Masterportal ([documentation](#following-is-the-official-documentation-of-the-masterportal))
that provide functionality necessary for the co-creative workshops
held by the CityScienceLab in order to test new technology in the
processes. The tools in this repository are two add-ons for the [Connected Urban Twin (CUT)](https://www.hamburg.de/cut/)
and gather mobility data of unpaid care workers.

The first add-on is a storytelling tool that ....

The second add-on enables users to input their ....

This repository is ready to build with Docker if you plan on trying out the application.


You can also build this repository with npm if you plan o connecting a database or adjusting the code to your needs.

#### Node.js

Install **[Node.js](http://nodejs.org)**. Last known working version is *v10.18.0 LTS* with *NPM version 6.13.4*.

#### Masterportal installation

Execute the git bash as admin and navigate to the folder the repository is to be cloned to.

Clone the repository and navigate to the folder created:

```console
$ git clone https://bitbucket.org/geowerkstatt-hamburg/masterportal.git
```

Install the `node_modules` required for the addons:

Step 1:
```console
$ cd masterportal\addons\mobilityDataDraw
$ npm install
```

Step 2:
```console
$ cd masterportal\addons\storyTellingTool
$ npm install
```

Install the `node_modules` required for the Masterportal:

```console
$ cd masterportal
$ npm install
```

With this, all dependencies are installed.

In case you need further information about how add-ons are to be used, please refer to the **[add-ons documentation](addonsVue.md)** for further assistance.

### `npm start`

This command starts a local development server.

```console
$ npm start
```

- After compilation, you may open the following links for comprehensive demo applications:
    - https://localhost:9001/portal/mobility-data Portal that includes the initial Faircare story as well as the data gathering tool
    - https://localhost:9001/portal/data-drawing-tool Portal that takes you directly to the data gathering

>⚠️ Please note that the demo application described above does not include a database. The data you entered will therefor not be stored.

TODO: What to do with the shared folder? Does it need to be so high up in the folder structure?
TODO: How to set up te database. Lets include the CREATE statement?
In case of a database connection the config.json needs to be adjusted:

```
Set API_BASE_URL to your database URL and change the TEST_ENV variable to false.
```

An example story can be found in the folder:
```
masterportal\portal\mobility-data\assets
```
This story is referenced in the storyConf variable in the config.js (masterportal\portal\mobility-data\config.js).

---
#### Following is the official documentation of the Masterportal

Official website of the [Masterportal](https://www.masterportal.org/)

The Masterportal is a tool-kit to create geo web applications based on [OpenLayers](https://openlayers.org), [Vue.js](https://vuejs.org/) and [Backbone.js](https://backbonejs.org). The Masterportal is Open Source Software published under the [MIT License](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/License.txt).

The Masterportal is a project by [Geowerkstatt Hamburg](https://www.hamburg.de/geowerkstatt/).

###### Developer section

* [Developer documentation](doc/devdoc.md)
* [Tutorial 01: Creating a new module (Scale switcher)](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/doc/vueTutorial.md)
* [Community board (Developer forum and issue tracker)](https://trello.com/c/qajdXkMa/110-willkommen)
