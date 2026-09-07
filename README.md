# highlightjs-jai

Jai language definition for `highlight.js`, as used in Discord etc.

## Usage

Install the package alongside Highlight.js:

```bash
npm install highlight.js highlightjs-jai
```

### Static website or simple usage

Load the browser bundle after Highlight.js.
The bundle registers Jai automatically.

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

CommonJS:

```javascript
const hljs = require('highlight.js');
const jai = require('highlightjs-jai');

hljs.registerLanguage('jai', jai);
```

ES modules:

```javascript
import hljs from 'highlight.js';
import jai from 'highlightjs-jai';

hljs.registerLanguage('jai', jai);
```

### React

You need to import both Highlight.js and the third-party language like Jai:

```js
import React, { Component } from 'react'
import hljs from 'highlight.js'

import 'highlight.js/scss/darcula.scss' // Your favourite theme.

import jai from 'highlightjs-jai'

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

An example theme is included.
It is mostly designed for testing the matching, but it uses separate structural CSS and configuration variables.
To make a custom Jai theme, copy [jaiEverything.css](dist/styles/jaiEverything.css) and alter the variables at the top.
You only need to set the variables you want to override; the structural rules provide fallbacks.

With a bundler, the theme can also be imported from the package:

```javascript
import 'highlightjs-jai/styles/jaiEverything.css';
```

See also the [css-class-reference](css-class-reference.md).

## Known Limitations
There are a few spots where we currently don't differentiate between line comments and block comments.

## License

This grammar is released under the MIT License.
See [LICENSE][1] file for details.

### Author & Maintainer

J.Chris Findlay <j.chris.findlay@gmail.com>

## Links

- The official site for the Highlight.js library is <https://highlightjs.org/>.
- The Highlight.js GitHub project: <https://github.com/highlightjs/highlight.js>.

[1]: https://github.com/highlightjs/highlightjs-jai/blob/main/LICENSE
