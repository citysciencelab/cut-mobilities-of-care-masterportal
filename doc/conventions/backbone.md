**3. Backbone**

3.1. Ein Modul besteht in der Regel aus einem Model, einer View, einem Template und einer CSS/LESS.

3.2. Im **Model** befindet sich die Logik und die Datenhaltung.

3.3. Das **Model** soll keine Listener auf seine eigenen Attribute haben.

3.4. Schreibe Setter-Funktionen für das **Model**.

3.5. Nutze die Getter-Funktionen von Backbone im **Model**.

3.6. Die **View** rendert das *Template* mit den Daten aus dem *Model* und kommuniziert zwischen User und dem *Model*. Sie enthält keine Logik und erzeugt keine HTML-Elemente.

3.7. Das **Template** beinhaltet die HTML-Vorlage des Moduls. Das Template enthält keine Style-Informationen, lediglich Ids und Klassen. HTML-Elemente sollen ausschließlich im Template erzeugt werden!

3.8. Im **CSS/LESS** ist das Styling des *Templates* hinterlegt.

3.9. Die Kommunikation **innerhalb eines Moduls** wird über die **[Backbone-Events](https://backbonejs.org/#Events)** durchgeführt.

3.10. Die Kommunikation **zwischen den Modulen** wird global mit **[Backbone-Radio](https://marionettejs.com/docs/master/backbone.radio.html)** durchgeführt.

Weitere Infos siehe **[Backbone](https://backbonejs.org/)**.
