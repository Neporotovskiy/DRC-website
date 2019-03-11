import React, { Fragment, PureComponent } from 'react';
import ReactDOM from 'react-dom';

import { Section } from './components/section/section';
import { Title } from './components/title/title';
import { Header } from './components/header/header';

import './normalize.pcss';
import './index.pcss';

export class Container extends PureComponent {
    render() {
        return (
            <Fragment>
                <Header>
                    <div className="button">Hello</div>
                </Header>
                <Section>
                    <Title>Hello there!</Title>
                </Section>
            </Fragment>
        );
    }
}

const render = () => ReactDOM.render(<Container />, document.getElementById('instruction-mounting-point'));

if (module.hot) module.hot.accept(render);

render();
