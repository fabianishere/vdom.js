# vdom.js
Very basic virtual dom in ES6 with components

## Examples
### Client-side
```jsx
/** @jsx h */
import { h } from 'vdom.js';
import { render } from 'vdom.js/dom';

render(<span class="message">Hello World</span>, document.body);
```

### Server-side
```jsx
/** @jsx h */
import { h } from 'vdom.js';
import { render } from 'vdom.js/string';

...

app.get('/page', (req, res) => res.send(render(<span class="message">Hello World</span>)));
```

### Components
```jsx
/** @jsx h */
import { h, Component } from 'vdom.js';
import { render } from 'vdom.js/dom';

class Clock extends Component {
    constructor(props, context) {
        super(props, context);
        // set initial time
        this.state.time = Date.now();
    }

    componentDidMount() {
        // update time every second
        this.timer = setInterval(() => {
            this.setState({ time: Date.now() });
        }, 1000);
    }

    componentWillUnmount() {
        // stop when not renderable
        clearInterval(this.timer);
    }

    render(props, state) {
        let time = new Date(state.time).toLocaleTimeString();
        return <span>{ time }</span>;
    }
}

// render an instance of Clock into <body>:
render(<Clock />, document.body);
```

### Pure Components
```jsx
/** @jsx h */
import { h } from 'vdom.js';
import { render } from 'vdom.js/dom';

const Welcome = props => (
  <span>Welcome { props.name }!</span>
);

// render an instance of Welcome into <body>:
render(<Welcome name="Fabian" />, document.body);
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

