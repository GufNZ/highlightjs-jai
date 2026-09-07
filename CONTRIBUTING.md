# Contributing Code

## Setup

To build highlightjs-jai, you'll need the latest long term support (LTS) release of Node and npm.
We recommend volta or nvm to manage multiple active Node versions.

Start by cloning the source from GitHub:

    $ git clone https://github.com/highlightjs/highlightjs-jai.git

Next, install the dependencies using `npm`:

    $ npm i

## Test

To execute the tests, open a terminal and type:

    $ npm t

## Build the distribution

Build the CommonJS, ES module, and browser distributions from this repository:

    $ npm run build

The generated files are written to `dist/` and should be committed.
