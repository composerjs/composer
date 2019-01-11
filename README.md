<p align="center">
    <img alt="composer" src="https://github.com/composerjs/composer/blob/master/logo.png" width="256">
    <h1 align="center" style="font-family: sans-serif; font-size: 32px; font-weight: 200;">Composer</h1>
</p>

<p align="center" style="font-family: sans-serif; font-size: 16px; font-weight: 500;">
    Experimental Build and Deployment tool
</p>

<p align="center">
    <a href="https://lernajs.io/"><img alt="lerna" src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg"></a>
</p>


## Plugins

### Core Plugins
Currently core plugins live in the `core` module, and use a
pipeline plugin (`core-alias`) to be less verbose.

#### Proposal A
Core Transform and IO plugins become separate npm modules (that still
reside in the mono-repo) and the core pipeline plugins live with
`composer`.

### Plugin Exports
* plugin exporting should be explicit
    * currently plugins either:
        * export default (for a mono-plugin repo)
        * named exports for each plugin type
            * read
            * write
            * transform
            * pipeline

#### Proposal A

##### Package.json
* package.json object that describes exports
```json
    "composer": {
        "exports": {
            "read": "read-plugin.ts",
            "write": "write-plugin.ts"
        }
    }
```

### Implicit streaming
* https://github.com/sindresorhus/into-stream#readme
* the intention is that plugin authors do not have to use or think about streams, but simply a promise interface (allotting for async/await use).

### Plugin validation at construction
* validate plugin paths at construction rather than throwing errors at runtime

### FS Optimizations
* migrate to https://github.com/mcollina/sonic-boom for filesystem writes
* migrate to `fs.createReadStream` for filesystem reads

### HTTP Optimizations
* migrate to https://www.npmjs.com/package/node-fetch for http

## Pipeline Optimization
* create a pipeline plugin to optimize configuration for the pipeline so that configuration authors can have an easy to read configuration that doesn't have
  to concern itself with efficiency.

## Caching
TBD

## Open Questions
* migrate away from Javascript classes to simple object factories?
* plugins should just be functions?
* what is the most optimal way to handle registering/loading plugins?
    * currently plugins are class based and must explicitly register themselves
    * when the plugin loader starts up it dynamically imports the plugins
* what is the fastest way to read file(s) locally?
* http should use `etags` and any other http caching mechanisms to cache remote reads.
* how should core plugins be loaded?
    * currently they're bundled with `core`, and handled via the `core-alias` pipeline plugin
* write to a tmp fs for caching builds?

## Roadmap

**`0.10.0` - prototype**
*`0.20.0` - experimental preview*
