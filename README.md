<p align="center">
<img src="https://user-images.githubusercontent.com/36763878/158801092-5258806e-32e3-4512-9e72-8b5cf9534d1a.jpg" alt="drawing" width="400"/>
</p>

# Mobilities of care
## City Science Lab - Connected Urban Twin

https://user-images.githubusercontent.com/61881523/177163402-5a5229a4-9faf-4c12-9067-dcc5f8089c2f.mp4

(You can acccess the video in 4k [here](https://youtu.be/iqi-qff7fCg))


Care workers have specific demands on urban (transport) infrastructure due to fragmented mobility patterns, which are not sufficiently addressed by current urban development and are underrepresented in planning and participation processes. The tools in this repository are two add-ons for the Masterportal ([documentation](#following-is-the-official-documentation-of-the-masterportal)) that provide functionality necessary for the co-creative workshops held by the CityScienceLab in order to test new technology in the processes. The tools in this repository are two add-ons for the [Connected Urban Twin (CUT)](https://www.hamburg.de/cut/) and gather mobility data of unpaid care workers.

The first add-on is a storytelling tool that enables one to both create and play data stories. These stories can be created by an interface integrated in the add-on or created manually in a JSON format.  Besides engaging data visualization, digital storytelling is a key method to support the individual, group or sociocultural understanding of
information and promote participation in the respective topic. They consist of different chapters that each display certain segments of the map with zero or more data layers. In each chapter, the data layers and the map can be contextualized with text and images.

A detailed description about how to manually configure a web GIS data-story can be found [here](addons/storyTellingTool/doc/config.json.md).

https://user-images.githubusercontent.com/36763878/161025746-b8ac51be-a687-4e63-8bcf-b1da01334ead.mp4

The second add-on is a data collection tool that enables users to input their routine mobility pattern for any given regular day. It first collects sociodemographic data from the user before the user can start entering their mobility patterns. After any daily routines are finished, there is the possibility to annotate points, lines or areas of interest, e.g. The gathered data is supposed to enable planners to learn more about certain spaces that are important for the mobility demands of unpaid care workers.

This [documentation](addons\mobilityDataDraw\doc\config.json.md) describes how to configure and activate the mobility data tool.

https://user-images.githubusercontent.com/36763878/161026501-89eca215-a504-4da6-b49b-278b6981cd10.mp4

In order to set up both tools, there are two main ways:

1. For a fully working local version **with** a backend and the respective APIs to store the mobility data, you can use the [Docker setup](#docker)
1. To experiment and continue developing the addons **without** a pre-defined backend and APIS, you can use the [Masterportal setup](#masterportal-setup)

### Docker


This part of the repository is for quickly setting up a local version of a Masterportal instance including both the storytelling tool and the data collection tool. Additionally, a Postgres backend is set up with both an internal and an external API to collect data with the Data collection tool and export it.

#### Docker Deployment

Deploy the frontend and backend applications including database to Docker.

```
docker-compose up
```

Default path for frontend in docker deployment: http://localhost/mobility-data/index.html

API is deployed in two variants, external and internal.

External API: http://localhost:8080

Internal API: http://localhost:8081

External API can be exposed to frontend for data collection. Internal API provides endpoints for data analysis, e.g. GET http://localhost:8081/person.

For an overview of all endpoints see [mobility-backend/README.md](mobility-backend/README.md).


### Masterportal setup

You can also start the application with npm if you plan on connecting a database, creating a new story or adjusting the code to your needs.

#### Node.js

Install **[Node.js](http://nodejs.org)**. Last known working version is *v10.18.0 LTS* with *NPM version 6.13.4*.

#### Masterportal installation

Execute the git bash as admin and navigate to the folder the repository is to be cloned to.

Clone the repository and navigate to the folder created:

```console
git clone https://bitbucket.org/geowerkstatt-hamburg/masterportal.git
```

Install the `node_modules` required for the addons:

Step 1:
```console
cd masterportal\addons\mobilityDataDraw
npm install
```

Step 2:
```console
cd masterportal\addons\storyTellingTool
npm install
```

Install the `node_modules` required for the Masterportal:

```console
cd masterportal
npm install
```

With this, all dependencies are installed.

In case you need further information about how add-ons configured and developed, please refer to the **[add-ons documentation](doc/addonsVue.md)** for further assistance.

This command will start a local development server.

```console
npm start
```

- After compilation, you may open the following links for comprehensive demo applications:
    - https://localhost:9001/portal/mobility-data Portal that includes the initial Faircare story as well as the data gathering tool
    - https://localhost:9001/portal/data-drawing-tool Portal that takes you directly to the data gathering

>⚠️ Please note that the demo application described above does not include a database. The data you entered will therefore not be stored. Starting the tool with [Docker](#docker-deployment) will initialize the tool with a working database.

The [sql file](mobility-backend/db/setup/dbinit.sql) contains all necessary statements for a custom database setup.
In case of an existing/custom database connection the config.json needs to be adjusted:

```
Set API_BASE_URL to your database URL and change the TEST_ENV variable to false.
```

An example story can be found in the folder:
```
masterportal\portal\mobility-data\assets
```
The stories are referenced in the storyConf variable in the [config.js](portal\mobility-data\config.js).

---
#### Following is the official documentation of the Masterportal

Official website of the [Masterportal](https://www.masterportal.org/)

The Masterportal is a tool-kit to create geo web applications based on [OpenLayers](https://openlayers.org), [Vue.js](https://vuejs.org/) and [Backbone.js](https://backbonejs.org). The Masterportal is Open Source Software published under the [MIT License](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/License.txt).

The Masterportal is a project by [Geowerkstatt Hamburg](https://www.hamburg.de/geowerkstatt/).

###### Developer section

* [Developer documentation](doc/devdoc.md)
* [Tutorial 01: Creating a new module (Scale switcher)](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/doc/vueTutorial.md)
* [Community board (Developer forum and issue tracker)](https://trello.com/c/qajdXkMa/110-willkommen)
