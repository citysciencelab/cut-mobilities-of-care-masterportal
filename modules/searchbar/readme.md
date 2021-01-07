# Readme

The search bar expects a wide range of configuration object parameters. See JSDoc for details.

These control which search algorithms the UI is to use. The search bar requires and starts these modules. Each search algorithm is in a nested module to the search bar and communicates with the search bar by using the `Backbone.Radio`.

Zooming to hits, too, is done by using the `Radio` and thus connects the search bar to the `mapMarker`.

The search bar handles displaying hits found by search algorithms itself.
