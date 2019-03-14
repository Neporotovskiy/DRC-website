import React, { PureComponent, Fragment } from 'react';
import classNames from 'classnames';

import { Section } from '../section/section';

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
        units: ['mm', 'миллиметр'],
        tip: (
            <span>
                <b>Ширина режущей кромки полотна</b>, которое будет использоваться для разделения заготовки на готовые
                изделия. Это необходимо для внесения погрешности при рассчетах количества итоговых изделий в заготовке.
            </span>
        ),
        validation: value => {
            if (validate(value).isNotNumber()) return false;
            return !validate(value).isGreaterThan(1000);
        },
    },
    assetLength: {
        placeholder: 'Укажите длину одной заготовки',
        units: ['mm', 'миллиметр'],
        tip: (
            <span>
                <b>Минимальная длина отдельно взятой заготовки</b>, используется для разделения заготовки на готовые
                изделия с учетом ширины режущей кромки полотна.
            </span>
        ),
        validation: value => !validate(value).isNotNumber(),
    },
    calculationAccuracy: {
        placeholder: ' Укажите точность рассчетов',
        tip: (
            <span>
                <b>Точность расчетов</b>, указывает с какой точностью должен работать алгоритм. В это поле необходимо
                ввести количество знаков после запятой, которое будет использоваться алгоритмом для рассчетов.
                По-умолчанию используется точность до сотых частей миллиметра.
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
                    <Fragment>
                        <b>Шаг №2</b>: Укажите необходимые размеры и допуски.
                    </Fragment>
                }
            >
                {Object.keys(fields).map(key => {
                    const { placeholder, units, tip } = fields[key];
                    const { [key]: value } = this.state;

                    return (
                        <div className={style.line} key={key}>
                            <input
                                type="text"
                                maxLength="7"
                                value={value}
                                className={style.input}
                                placeholder={placeholder}
                                onChange={this.updateValue(key)}
                            />
                            <div className={style.additionalContent}>
                                {do {
                                    if (typeof units !== 'undefined') {
                                        const [label, name] = units;
                                        <div
                                            className={classNames(style.additionalContentItem, style.units)}
                                            title={`Единица измерения: ${name}`}
                                        >
                                            {label}
                                        </div>;
                                    } else null;
                                }}
                                {do {
                                    if (typeof tip !== 'undefined') {
                                        <div
                                            className={classNames(style.additionalContentItem, style.tip)}
                                            title="Подсказка"
                                        >
                                            <span>Подсказка</span>
                                            <div className={style.content}>{tip}</div>
                                        </div>;
                                    } else null;
                                }}
                            </div>
                        </div>
                    );
                })}
            </Section>
        );
    }
}
