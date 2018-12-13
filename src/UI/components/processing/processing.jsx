import React, { Component } from 'react';
import classNames from 'classnames';

import { Title } from '../title/title';

import s from './processing.pcss';

const fields = {
    sawWidth: {
        placeholder: 'Укажите ширину режущей кромки',
        units: ['mm', 'миллиметр'],
        tip: (
            <span>
                <b>Ширина режущей кромки режущего полотна</b>, которое будет использоваться для разделения заготовки на
                готовые изделия. Это необходимо для вычисления количества целых изделий в отдельно взятой заготовке
            </span>
        ),
    },
    assetLength: {
        placeholder: 'Укажите длину одной заготовки',
        units: ['mm', 'миллиметр'],
        tip: (
            <span>
                <b>Минимальная длина отдельно взятой заготовки</b>, используется для разделения заготовки на готовые
                изделия с учетом погрешности.
            </span>
        ),
    },
    calculationAccuracy: {
        placeholder: ' Укажите точность рассчетов',
        tip: (
            <span>
                <b>Точность расчетов</b>, указывает с какой точностью должен работать алгоритм. Если размеры изделий
                указаны с использованием чисел повышенной точности, то в это поле необходимо ввести количество знаков
                после запятой с точностью до которых предстоит работать алгоритму.&nbsp;
                <b>Алгоритм может давать неточный результат при значениях точности свыше тысячной доли миллиметра.</b>
                &nbsp;По-умолчанию используется точность до сотых частей миллиметра.
            </span>
        ),
    },
};

export class Processing extends Component {
    state = {
        sawWidth: '',
        assetLength: '',
        calculationAccuracy: '',
    };

    updateValue = (field) => ({target: {value}}) => {
        this.setState({[field]: value});
    };

    render() {
        const { active } = this.props;

        if (!active) {
            return (
                <section>
                    <Title inactive>
                        <b>Шаг №2</b>: Укажите необходимые размеры и допуски.
                    </Title>
                </section>
            );
        }

        return (
            <section>
                <Title>
                    <b>Шаг №2</b>: Укажите необходимые размеры и допуски.
                </Title>

                {Object.keys(fields).map(key => {
                    const { placeholder, units, tip } = fields[key];
                    const { [key]: value } = this.state;

                    return (
                        <div className={s.line} key={key}>
                            <input
                                type="text"
                                value={value}
                                className={s.input}
                                placeholder={placeholder}
                                onChange={this.updateValue(key)}
                            />
                            <div className={s.additionalContent}>
                                {do {
                                    if (typeof units !== 'undefined') {
                                        const [label, name] = units;
                                        <div
                                            className={classNames(s.additionalContentItem, s.units)}
                                            title={`Единица измерения: ${name}`}
                                        >
                                            {label}
                                        </div>;
                                    } else null;
                                }}
                                {do {
                                    if (typeof tip !== 'undefined') {
                                        <div className={classNames(s.additionalContentItem, s.tip)} title="Подсказка">
                                            <span>Подсказка</span>
                                            <div className={s.content}>{tip}</div>
                                        </div>;
                                    } else null;
                                }}
                            </div>
                        </div>
                    );
                })}
            </section>
        );
    }
}
