
# Translation Guide

This document describes how to work with languages and translations in the Masterportal (MP).
It is intended for beginners, advanced users and experts.

The goals of ths document are as follows:

1. To show how to expand language files and add new languages (beginners).
2. To show how to put languages into new models (advanced users).
3. To show how we managed to put translations and languages to work (experts).




## Background

This section provides some background and common knowledge around working with translations and languages in the MP.


### Technology

The used technology for the translation of the MP is "i18next" (https://www.i18next.com/).

For advanced users and experts we recommend to read the short but sharp documentation of i18next.

Following i18next plugins are used:

* [i18next-http-backend](https://github.com/i18next/i18next-http-backend) to use of language files rather then hard coded translations
* [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector) for detecting the language of the browser, use of the localStorage and reacting of the query url

i18next broadcasts a change in language with this Radio Event: "i18next#RadioTriggerLanguageChanged".
To use i18next in code it is provided as the global variable "i18next" or for devs from browser console with "Backbone.i18next".


### Languages

As the MP is currently mainly developed in Hamburg Town of Germany the language to fallback on is german.
(You can change your fallback language manualy in the config.js.)

We of course provide a complete english translation at any point in time:

1. German
2. English

### Konfiguration

The configuration of the languages and i18next takes place in the config.js: **[Documentation config.js](config.js.md)**.


### Language Files

Language Files are used to store translations in "Keys". These Keys are important to access translations in code and in the config of the MP.
To work with Language Files we assume basic knowledge for the JSON syntax.
For beginners we recommend a short look into JSON guides:

* https://restfulapi.net/json-syntax/
* https://www.w3schools.com/js/js_json_syntax.asp

## Language Files

Language files are the core of the translations. Any language needs its own translation files.
We decided to split translations into two different files:

1. common
2. additional

See the **[architecture](i18next.jpeg)**


### Common Language File - common.json
The Common Language File is the collection of all translations used throughout the MP in its standard configuration.
This includes common modules as well as most used menu entries and application logic.

### Additional Language File - additional.json
The Additional Language File is used for addons (former custom modules).




## How to use i18next in production

This section is a guide of how to work i18next into your MP project using MV*.



### Translate your model

To translate values for your model with i18next, you can simply set the values using the translation function of i18next.
Listening to the Radio Event "i18next#RadioTriggerLanguageChanged" the model can change its values during runtime.


ExampleModel
```
const ExampleModel = Backbone.Model.extend(/** @lends ExampleModel.prototype */ {
    defaults: {
        currentLng: "",
        exampleTitle: "",
        exampleText: ""
    },
    /**
     * @class ExampleModel
     * @extends Backbone.Model
     * @memberof Example
     * @constructs
     * @listens i18next#RadioTriggerLanguageChanged
     */
    initialize: function () {
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang(i18next.language);
    },
    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function (lng) {
        this.set({
            currentLng: lng,
            exampleTitle: i18next.t("common:foo.bar.exampleTitle"),
            exampleText: i18next.t("common:foo.bar.exampleText")
        });
    }
});

export default ExampleModel;
```


#### Listen to your model


If set up properly, the view should listen to changes in the model and renders the template already.
Currently in the Masterportal we use Unserscore for templating.
To show how this SHOULD be done let's use the model from above and setup the MV* as follows.

ExampleTemplate
```
<!DOCTYPE html>
<div class="title"><%= exampleTitle %></div>
<div class="text"><%= exampleText %></div>
```

ExampleView
```
import ExampleTemplate from "text-loader!./template.html";
import ExampleModel from "./model";

const ExampleView = Backbone.View.extend(/** @lends ExampleView.prototype */{
    /**
     * @class ExampleView
     * @extends Backbone.View
     * @memberof Example
     * @constructs
     * @listens ExampleModel#changeExampleText
     */
    initialize: function () {
        this.model = new ExampleModel();

        this.listenTo(this.model, {
            "change:currentLng": this.render
        });

        this.render();
    },

    /**
     * renders the view
     * @param {ExampleModel} model the model of the view
     * @param {Boolean} value the values of the changes made to the model
     * @returns {Void}  -
     */
    render: function () {
        const template = _.template(ExampleTemplate),
            params = this.model.toJSON();

        this.$el.html(template(params));

        return this;
    }
});

export default ExampleView;
```






## Translation of the names in the config.json

This section describes a different take on i18next to translate values put into the config.json.
First is a best practice szenario.
Second is the description what happens in the background and why it happens.


### Best practice szenario

### Menu

To translate a value from the config.json the value itself has to be formated correctly.
This formated value must than be placed into the translation files.
If the part of the config.json is considered for translation by the Masterportal, the translation will take place as required.
Only the field *"name"* is considered during translation!

Translation File common.json
```
{
    "foo": {
        "bar": {
            "exampleMenuTitle": "titulum menu",
            "exampleLayerName": "aliquid",
            "exampleSubjectData": "subject data"
        }
    }
}
```



Part of the config.json you can edit for translation of the menu:
```
{
    "Portalconfig": {
        "menu": {
            "example": {
                "name": "translate#common:foo.bar.exampleMenuTitle",
                "glyphicon": "glyphicon-list",
                "isInitOpen": false
            }
        }
    }
}
```
The translation key must be preceded by the following text: translate#.

Structure:
translate#[Sprachdateiname]:[Pfad zum Key] = translate#common:foo.bar.exampleMenuTitle

As the menu is already programmed to react for the translation prefix ("translate#") correctly, this is all to do for a menu entry.

### Tree of topics

Similar to the menu the tree of topics (german: "Themenbaum") can be translated as well.

**Please be aware**: A translation key added to an item in the tree of topics will overwrite any titles or names coming from services.

If the treeType is "default" or "custom" the name of the folder can be specified. In the example below, the tree would then contain the value for the key "foo.bar.exampleSubjectData" instead of "Fachdaten".

Default translations:

* Baselayer: Background maps
* Overlay: Subject data
* 3d-layer: 3D data

Part of the config.json you can edit for translation of the tree of topics
```
{
    "Themenconfig": {
        "Fachdaten": {
            "name": "translate#common:foo.bar.exampleSubjectData",
            "Layer": [
                  {
                    "id": "2128",
                    "name": "translate#common:foo.bar.exampleLayerName"
                  }
            ]
        }
    }
}
```
There are the following possibilities and the following hierarchy:

* "name": "my special subjects" --> will never be translated
* "name": "translate#common:foo.bar.exampleMenuTitle" --> will be translated, if the key exists
* no name specified (the field name does not exist) --> default translation (see above)

### Tools

Similar to the menu the tools (german: "Werkzeuge") can be translated as well.
This includes the entry in the menu under "Tools" and the title of the tool window.

Part of the config.json you can edit for translation of the tools
```
      "tools":
      {
        "name": "Werkzeuge",
        "glyphicon": "glyphicon-wrench",
        "children": {
          "draw":
          {
            "name": "translate#common:foo.bar.exampleMenuTitle",
            "glyphicon": "glyphicon-pencil"
          },
          ...
```
The following possibilities and following hierarchy exist:

* "name": "Zeichnen / Schreiben" --> is never translated
* "name": "translate#common:foo.bar.exampleMenuTitle" --> is translated, if the key exists
* no name specified (the Name field does not exist) --> Name comes from the model.js (here ../tools/draw/model.js)

#### Define tool name in the model.js

If the field "name" in the model.js is filled, it is considered the default name, which is not translated.
```
const DrawTool = Tool.extend(/** @lends DrawTool.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        name: "Zeichnen / Schreiben",
        ...
```

If it should be translated, the key for the translation of the name can be entered in the field "nameTranslationKey".
```
const DrawTool = Tool.extend(/** @lends DrawTool.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        nameTranslationKey: "common:menu.tools.draw",
        ...
```
## Translations in addons


The language files must be stored under ./addons/{addon-name}/locales/{language}/additional.json

A Translation is implemented this way:
```
i18next.t("additional:modules.tools.example.title"),

```
[sample](https://bitbucket.org/geowerkstatt-hamburg/addons/src/master/einwohnerabfrage/)

## Interesting i18nxt translation functions

### Interpolation

Integrate dynamic values into your translations.

key
```
{
    "key": "{{what}} is {{how}}"
}
```
sample
```
i18next.t('key', { what: 'i18next', how: 'great' });
// -> "i18next is great"
```
[link](https://www.i18next.com/translation-function/interpolation#basic)

### Singular / Plural

Automatic recognition of singular and plural.

Note: The variable name must be count!

keys
```
{
  "key": "item",
  "key_plural": "items",
  "keyWithCount": "{{count}} item",
  "keyWithCount_plural": "{{count}} items"
}
```
sample
```
i18next.t('key', {count: 0}); // -> "items"
i18next.t('key', {count: 1}); // -> "item"
i18next.t('key', {count: 5}); // -> "items"
i18next.t('key', {count: 100}); // -> "items"
i18next.t('keyWithCount', {count: 0}); // -> "0 items"
i18next.t('keyWithCount', {count: 1}); // -> "1 item"
i18next.t('keyWithCount', {count: 5}); // -> "5 items"
i18next.t('keyWithCount', {count: 100}); // -> "100 items"
```
[link](https://www.i18next.com/translation-function/plurals#singular-plural)


### Nesting

Nesting allows you to reference other keys in a translation.

keys
```
{
    "nesting1": "1 $t(nesting2)",
    "nesting2": "2 $t(nesting3)",
    "nesting3": "3",
}
```
sample
```
i18next.t('nesting1'); // -> "1 2 3"
```
[link](https://www.i18next.com/translation-function/nesting#basic)


### Formatting

[link](https://www.i18next.com/translation-function/formatting#formatting)


## Common errors

You have set a translation key but what is shown is the translation key itself.
    Please check the correct spelling of the key. i18next can't find this key neither in the selected language file nor in the fallback language file.

You have set a translation key in the config.json but allways the startup language is shown, never changes language.
    The thing to check here is wheather or not the module controlled by this part of the config.json has been programmed to react to translation anyways.
    Expert: The content of the config.json is translated on startup entirely. For translation the translation function i18nextTranslate is used from this point on. If not used, the content will stay as it is even if the language changes.





## Unit Tests

i18next provides a test mode for unit testing.
In test mode no real translation will be made (no files will be loaded).
Instead i18next always responds with the given key.

For unit testing in the Masterportal we use "chai".
To setup i18next for unit testing init it in your before with lng "cimode". This will set i18next into test mode.

```
before(function () {
    i18next.init({
        lng: "cimode",
        debug: false
    });
    model = new Model();
});
```





