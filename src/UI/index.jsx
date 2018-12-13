import React, { Fragment, PureComponent } from 'react';
import ReactDOM from 'react-dom';

import { Header } from './components/header/header';
import { Uploading } from './components/uploading/uploading';
import { Processing } from './components/processing/processing';

import './normalize.pcss';
import './index.pcss';

export class Container extends PureComponent {
    state = {
        currentStep: 0,
        currentStepData: {},
        isFileAPISupported: ['FileReader', 'FileList', 'File'].every(API => API in window),
    };

    // steps = [Uploading, Processing];
    steps = [Processing];

    continue = (step, data) => () => {
        const { currentStep, currentStepData } = this.validateStepResult(step, data);
        this.setState({ currentStep, currentStepData });
    };

    validateStepResult = (step, data) => {
        switch (step) {
            case 0: {
                if (data.length > 0) {
                    return { currentStep: 1, currentStepData: data };
                }
                return { currentStep: 0, currentStepData: {} };
            }
            case 1: {
                // if (something went wrong) return { currentStep: 1, currentStepData: {} }
                return { currentStep: 2, currentStepData: data };
            }
        }
    };

    render() {
        const { isFileAPISupported, currentStep, currentStepData } = this.state;

        if (!isFileAPISupported)
            return (
                <section>
                    Данный браузер не поддерживает <b>File API</b>. Используйте более современный браузер.
                </section>
            );

        return (
            <Fragment>
                <Header />
                {this.steps.map((Component, index) => (
                    <Component
                        active={currentStep === index}
                        continue={this.continue}
                        data={currentStepData}
                        key={index}
                    />
                ))}
            </Fragment>
        );
    }
}

const render = () =>
    ReactDOM.render(<Container />, document.getElementById('react'));

if (module.hot) module.hot.accept(render);

render();
