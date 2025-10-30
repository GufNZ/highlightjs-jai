# highlightjs-jai

//TODO: test with normal theme, e.g. GitHub dark.

Jai language definition for `highlight.js`, as used in Discord etc.

## Usage

Simply include the Highlight.js library in your webpage or Node app, then load this module.

### Static website or simple usage

Simply load the module after loading Highlight.js.
You'll use the minified version found in the `dist` directory.
This module is just a CDN build of the language, so it will register itself as the Javascript is loaded.

```html
<script type="text/javascript" src="/path/to/highlight.min.js"></script>
<script type="text/javascript" charset="UTF-8" src="/path/to/highlightjs-jai/dist/jai.min.js"></script>
<script type="text/javascript">
  hljs.highlightAll();
</script>
```

### Using directly from the UNPKG CDN

```html
<script type="text/javascript" src="https://unpkg.com/highlightjs-jai/dist/jai.min.js"></script>
```

- More info: <https://unpkg.com>

### With Node or another build system

If you're using Node/Webpack/Rollup/Browserify, etc, simply require the language module, then register it with `highlight.js`.

```javascript
var hljs = require('highlightjs');
var hljsJai = require('highlightjs-jai');

hljs.registerLanguage("jai", hljsJai);
hljs.highlightAll();
```

### React

You need to import both Highlight.js and the third-party language like Jai:

```js
import React, { Component } from 'react'
import hljs from 'highlight.js'

import 'highlight.js/scss/darcula.scss' // Your favourite theme.

import jai from './jai'

hljs.registerLanguage('jai', jai);

class Highlighter extends Component {
  constructor(props) {
    super(props);
    hljs.highlightAll();
  }

  render() {
    const { children } = this.props;
    return (
      <pre ref={(node) => this.node = node}>
        <code className="jai">
          {children}
        </code>
      </pre>
    );
  }
}

export default Highlighter;
```

## Theme

There is included an example theme.  It's mostly designed for testing the matching, but it's built using separate structural CSS and config vars, so for best results when making a custom theme for jai, copy the [jaiEverything.gss](dist/styles/jaiEverything.css) and just alter the set of vars at the top, noting that you don't need to set all of them - the structural part has sane fallbacks.

See also the [css-class-reference](css-class-reference.md).

## License

Highlight.js is released under the MIT License.
See [LICENSE][1] file for details.

### Author & Maintainer

J.Chris Findlay <j.chris.findlay@gmail.com>

## Links

- The official site for the Highlight.js library is <https://highlightjs.org/>.
- The Highlight.js GitHub project: <https://github.com/highlightjs/highlight.js>.

[1]: https://github.com/GufNZ/highlightjs-jai/blob/master/LICENSE
