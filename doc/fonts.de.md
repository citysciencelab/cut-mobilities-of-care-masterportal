# Fonts im Masterportal #

Im Masterportal werden zwei Schriftarten verwandt "MasterPortalFont" und "MasterPortalFont Bold". Hinter diesen Bezeichnungen verbirgt sich standardmäßig die Schriftart "roboto", sie steht unter Apache Lizenz 2.0 und kann beliebig verwandt werden.

Die Bezeichnung "MasterPortalFont" und deren Verwendung im Masterportal CSS-Code erlaubt es Nutzern auf einfache Weise ihre eigene bzw. eine andere Schriftart einzubinden. Dazu muss lediglich in eine zusätzliche CSS-Datei erstellt und in der Index-html als Link-tag oder Code eingefügt werden.

Dort kann dann für die jeweilige Bezeichnung eine andere Schriftart hinterlegt werden, z.B.:

```
    @font-face {
        font-family: 'MasterPortalFont';
        src: url('https://fonts.gstatic.com/s/comingsoon/v11/qWcuB6mzpYL7AJ2VfdQR1t-VWDk.woff2');
    }


    @font-face {
        font-family: 'MasterPortalFont Bold';
        src: url('https://fonts.gstatic.com/s/permanentmarker/v9/Fh4uPib9Iyv2ucM6pGQMWimMp004La2Cfw.woff2');
    }

```
