Composer Mono-Repo
==================

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

SEE:  https://npmjs.com/composerjs/composer

## Roadmap

### Type Definitions

* generate .t.ds file

### Configuration

#### JSON



#### Options
* `alias`
    * set an alias for a plugin
* `filter`
    * run the pipeline on a constraint set of the input

### CLI

* `init`
    * initialize a new composer configuration
    * interactive prompt
* `build`
    * run the pipeline configuration
    * `-c`, `--config` specify a config
        * defaults to composer-config.js
* `ls`
    * list all installed plugins
* `audit`
    * list all unused plugins
* `doctor`
    * interactive prompt
* `install`
    * install a plugin
    * interactive prompt
    * plugin registry repo
