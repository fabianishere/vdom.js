# vdom.js
Very basic virtual dom in ES6

## Example
Client-side
```jsx
import { h } from 'vdom.js';
import { render } from 'vdom.js/dom';

render(<span class="message">Hello World</span>, document.body);
```

Server-side
```jsx
import { h } from 'vdom.js';
import { render } from 'vdom.js/string';

...

app.get('/page', (req, res) => res.send(render(<span class="message">Hello World</span>)));
```

## Building
To build the project, install the dependencies and then run the following to build the project
```sh
$ npm run build
```

## Motivation
This project was created as learning excercise for an assigment for the Web and Database Technology course of 2016 at Delft University of Technology.

## License
The code is released under the MIT license. See the `LICENSE` file.

