#### Beschreibung
Dieses Modul kann geladene Vektordaten in einer Tabelle darstellen. Über einen Config-Eintrag wird das Modul geladen. Es reagiert auf das layerlist:sendVisibleWFSlayerList Event.
Dieses schickt alle geladenene WFS-Layer an das Modul. Das Modul merkt sich die Informationen und zeigt eine Auflistung im ersten Tab. Wird ein Eintrag (Layer) in diesem Tab ausgewählt,
so wird dessem LayerId gespeichert. Aus der Layerliste wird dann der selektierte Layer gefiltert und gespeichert. Darauf wird reagiert und die Features des Layers werden ausgewertet und
im zweiten Tab der Tabelle aufgelistet. Aus Performancegründen werden nicht alle Features geladen sondern max. soviele, wie in der Konfiguration angegeben. Sind nicht alle Features geladen,
wird ein Knopf angezeigt, der das nachladen weiterer Features ernöglicht. Über ein Hover-Event wird gesteuert, dass gehoverte Features in der Karte gehighlighted werden. Durch Klick auf ein
Ferature werden dessen Attribute in einem dritten Tab vollständig dargestellt. Zukünftig könnten hier die Attribute bei WFS-T auch editiert werden. Der Tabelle wurde eine Sortiermöglichkeit
implementiert.
