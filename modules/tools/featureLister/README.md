# Readme

## Description

This module can be used to display loaded vector data as a table. It is loaded by configuration and reacts to the `layerlist:sendVisibleWFSlayerList` event.

This event sends all loaded WFS layers to the module. It memorizes the information and displays a list in its first tab. Whenever an entry (layer) from the list is chosen, its LayerId is saved. Then, from the layer list, the selected layer is filtered and saved.

As a reaction to that selection, the layer features are evaluated and listed in the second tab. For performance reasons, not all features, but at most the configured amount of features is initially loaded, and a button is shown that allows loading additional features to this table.

A hover event controls highlighting hovered features in the map. By clicking a feature, its attributes are shown completely in a third tab. In the future, WFS-T attributes should be editable here. The table also provides sort functionalities.
