import React, { Fragment, PureComponent } from 'react';
import ReactDOM from 'react-dom';

import { Section } from '../../components/section/section';
import { Title } from '../../components/title/title';
import { Header } from '../../components/header/header';
import { Uploading } from '../../components/uploading/uploading';
import { Parameterization } from '../../components/parameterization/parameterization';
import { Processing } from '../../components/processing/processing';

import '../../normalize.pcss';
import '../../common.pcss';

export class Container extends PureComponent {
    state = {
        step: 0,
        data: {
            uploading: null,
            parametrization: null,
        },
        isNecessaryAPISupported: ['FileReader', 'FileList', 'File', 'Worker'].every(API => API in window),
    };

    steps = [
        {
            name: 'uploading',
            component: Uploading,
            validation: value => value !== null && value.length !== 0,
        },
        {
            name: 'parametrization',
            component: Parameterization,
            validation: value => value !== null,
        },
        {
            name: 'processing',
            component: Processing,
            validation: value => value !== null,
        },
    ];

    updateData = (name, data) => {
        const { data: remainingData } = this.state;
        return { ...remainingData, [name]: data };
    };

    onBack = () => {
        const { step } = this.state;
        if (step > 0) {
            const { name } = this.steps[step - 1];
            this.setState({
                step: step - 1,
                data: this.updateData(name, null),
            });
        }
    };

    onContinue = data => {
        const { step } = this.state;
        const { validation, name } = this.steps[step];
        const { length } = this.steps;
        if (step < length && validation(data))
            this.setState({
                step: step + 1,
                data: this.updateData(name, data),
            });
    };

    render() {
        const { isNecessaryAPISupported, step, data } = this.state;

        if (!isNecessaryAPISupported)
            return (
                <Section active title={<Title>Устаревшая платформа</Title>}>
                    <p>
                        Данный браузер не поддерживает работу с файлами и/или фоновые вычисления. Используйте более
                        современный браузер.
                    </p>
                    <p>
                        <b>{navigator.userAgent}</b>
                    </p>
                </Section>
            );

        return (
            <Fragment>
                <Header/>
                {this.steps.map(({ component: Component, name }, index) => (
                    <Component
                        key={index}
                        active={index === step}
                        passed={index < step}
                        onContinue={this.onContinue}
                        onBack={this.onBack}
                        data={data}
                    />
                ))}
            </Fragment>
        );
    }
}

const render = () => ReactDOM.render(<Container />, document.getElementById('application-mounting-point'));

if (module.hot) module.hot.accept(render);

render();
