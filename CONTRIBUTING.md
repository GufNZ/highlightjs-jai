# Contributing Code

## Setup

To build highlightjs-jai, you'll need the latest long term support (LTS) release of Node and npm.
We recommend volta or nvm to manage multiple active Node versions.

Start by cloning the source from GitHub:

    $ git clone https://github.com/GufNZ/highlightjs-jai.git

Next, install the dependencies using `npm`:

    $ npm i

## Test

To execute the tests, open a terminal and type:

    $ npm t

## Build the distribution

To generate the `dist` file, we need to clone the [highlight.js](https://github.com/highlightjs/highlight.js) main repository:

    $ git clone https://github.com/highlightjs/highlight.js
    $ cd highlight.js

Since the tooling is not yet merged on master (see https://github.com/highlightjs/highlight.js/issues/2328), we need to checkout the `squash_build_pipeline` branch:

    $ git checkout squash_build_pipeline

Then, install the dependencies:

    $ npm i

Create an `extra` directory and clone the [highlightjs-jai](https://github.com/GufNZ/highlightjs-jai) repository in it:

    $ mkdir extra
    $ cd extra
    $ git clone https://github.com/GufNZ/highlightjs-jai
    $ cd ..

Now we are ready to generate the `dist` file.
Open a terminal and type:

    $ node --stack-size=65500 ./tools/build.js -t cdn

The generated file will be available in both `build/languages/jai.min.js` and `extra/highlightjs-jai/dist/jai.min.js`.
