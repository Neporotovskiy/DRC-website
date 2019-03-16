import React, { PureComponent } from 'react';
import classNames from 'classnames';

import { Section } from '../../components/section/section';

import style from './parameterization.pcss';

const validate = value => {
    const isNumber = value => {
        const isNaN = Number.isNaN || window.isNaN;
        const valueToNumber = Number(value);
        return !isNaN(valueToNumber);
    };
    return {
        isNotNumber() {
            return !isNumber(value);
        },
        isGreaterThan(minValue) {
            const valueToNumber = Number(value);
            return valueToNumber > minValue;
        },
    };
};

const fields = {
    cuttingEdge: {
        placeholder: 'Укажите ширину режущей кромки',
        unit: 'mm',
        tip: (
            <span>
                <b>Ширина режущей кромки полотна</b> - ширина режущей кромки полотна, которое будет использоваться для
                разделения заготовки на готовые изделия.
            </span>
        ),
        validation: value => {
            if (validate(value).isNotNumber()) return false;
            return !validate(value).isGreaterThan(1000);
        },
    },
    assetLength: {
        placeholder: 'Укажите длину заготовки',
        unit: 'mm',
        tip: (
            <span>
                <b>Длина заготовки</b> - длина бруса, из которого будут нарезаться готовые изделия.
            </span>
        ),
        validation: value => !validate(value).isNotNumber(),
    },
    calculationAccuracy: {
        placeholder: ' Укажите точность рассчетов',
        tip: (
            <span>
                <b>Точность расчетов</b> - указывает, с какой точностью должен работать алгоритм рассчетов. По-умолчанию
                используется точность до десятых частей миллиметра.
            </span>
        ),
        validation: value => {
            if (validate(value).isNotNumber()) return false;
            return !validate(value).isGreaterThan(3);
        },
    },
};

export class Parameterization extends PureComponent {
    state = {
        cuttingEdge: '',
        assetLength: '6000',
        calculationAccuracy: '1',
        valid: false,
    };

    componentDidUpdate() {
        const { cuttingEdge, assetLength } = this.state;
        const isSawWidthFulfilled = validate(cuttingEdge).isGreaterThan(0);
        const isAssetLengthFulfilled = validate(assetLength).isGreaterThan(0);
        const isValidationPassed = isSawWidthFulfilled && isAssetLengthFulfilled;
        this.setState({ valid: isValidationPassed });
    }

    updateValue = field => ({ target: { value } }) => {
        const { validation } = fields[field];
        if (validation(value)) {
            const trimmedValue = value.replace(' ', '');
            this.setState({ [field]: trimmedValue });
        }
    };

    onContinue = () => {
        const { cuttingEdge, assetLength, calculationAccuracy, valid } = this.state;
        const { onContinue } = this.props;
        if (valid) onContinue({ cuttingEdge, assetLength, calculationAccuracy });
    };

    render() {
        const { active, passed, onBack } = this.props;
        const { valid } = this.state;

        return (
            <Section
                active={active}
                passed={passed}
                valid={valid}
                onBack={onBack}
                onContinue={this.onContinue}
                title={
                    <div className="title">
                        <span>
                            <b>Шаг №2</b>: Укажите необходимые размеры и допуски.
                        </span>
                        <a
                            href="manual.html#parameters-passing"
                            target="-blank"
                            title="Инструкция ко второму шагу"
                            className="help"
                        >
                            ?
                        </a>
                    </div>
                }
            >
                {Object.keys(fields).map(key => {
                    const { placeholder, unit, tip } = fields[key];
                    const { [key]: value } = this.state;

                    return (
                        <div className={style.line} key={key}>
                            <label htmlFor={key} className={style.label}>
                                {placeholder}
                            </label>
                            <input
                                id={key}
                                type="text"
                                maxLength="7"
                                value={value}
                                className={style.input}
                                onChange={this.updateValue(key)}
                            />
                            <div className={style.additionalContent}>
                                {typeof unit !== 'undefined' && (
                                    <div className={classNames(style.additionalContentItem, style.units)}>{unit}</div>
                                )}
                                {typeof tip !== 'undefined' && (
                                    <div
                                        className={classNames(style.additionalContentItem, style.tip)}
                                        title="Подсказка"
                                    >
                                        <span>Подсказка</span>
                                        <div className={style.content}>{tip}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </Section>
        );
    }
}
