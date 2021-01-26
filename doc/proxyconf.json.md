>This file describes the `proxyconf.json` file structure and functionality.

>**_[GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Hence, the mechanism to request URLs via a proxy is _deprecated_. For additional information, please check _[chapter 4.7.1 of the GDI-DE documentation](https://www.gdi-de.org/SharedDocs/Downloads/DE/GDI-DE/Dokumente/Architektur_GDI-DE_Bereitstellung_Darstellungsdienste.pdf?__blob=publicationFile)_.**

# proxyconf.json (_deprecated_)

## Why do I need a proxy for my local development environment?

A proxy is required to load data from external domains. Trying to directly load such data would be blocked by the **[same-origin policy](https://de.wikipedia.org/wiki/Same-Origin-Policy)** implemented in browsers.

## How does a proxy work?

The proxy accepts requests to other domains in their place and handles retrieving the data, returning the results to the browser. Hereby the issues arising from the **[same-origin policy](https://de.wikipedia.org/wiki/Same-Origin-Policy)** are circumvented.

The file `proxyconf_example.json` (resp. `proxyconf.json`) describes to which domain the server running at localhost is supposed to forward requests.

## How to configure the Masterportal proxy?

The following example shows a Masterportal proxy configuration that allows using the Hamburg services via `geodienste.hamburg.de` in your local development environment.

**Example**
```json
{
  "/geodienste_hamburg_de": {
    "target": "http://geodienste.hamburg.de",
    "pathRewrite": {
      "^/geodienste_hamburg_de": ""
    },
    "agent": ""
  }
}
```

The first line of the object holds the domain name rewritten by the Masterportal for the request to `geodienste.hamburg.de`. This key is used to decide how the proxy is to handle the incoming request. The object values can be used as follows:

1. **target**: Domain the request is to be forwarded to.
2. **pathRewrite**: Contains a replacement rule to remove the previously rewritten domain from the request.
3. **agent**: Used to reach an internet address from behind an intranet corporate proxy. This value is automatically filled on server start from the system environment (process.env).
4. **Further parameters** are listed on **[https://webpack.js.org/](https://webpack.js.org/configuration/dev-server/#devserverproxy)**.

In Hamburg, we use a reverse proxy on one of our servers to avoid replicating the **pathRewrite** rules to each separate local development environment. In that scenario, another request to the actual domain is handled by the reverse proxy itself, and the rules only have to be kept on that single server.
