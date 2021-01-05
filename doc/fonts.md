# Masterportal font usage

The Masterportal comes bundled with the two fonts *MasterPortalFont* and *MasterPortalFont Bold*. By default, this is the renamed font "Roboto", which is available under the Apache License 2.0 and can be used arbitrarily.

The name *MasterPortalFont* and its usage in the Masterportal CSS files allows users to easily supply their own fonts. For this purpose, create an additional CSS file and insert it into the `index.html` as a link tag, or directly as code.

For the given name, any other font may be used, e.g. with this CSS:

```css
  @font-face {
    font-family: 'MasterPortalFont';
    src: url('https://fonts.gstatic.com/s/comingsoon/v11/qWcuB6mzpYL7AJ2VfdQR1t-VWDk.woff2');
  }

  @font-face {
    font-family: 'MasterPortalFont Bold';
    src: url('https://fonts.gstatic.com/s/permanentmarker/v9/Fh4uPib9Iyv2ucM6pGQMWimMp004La2Cfw.woff2');
  }
```
