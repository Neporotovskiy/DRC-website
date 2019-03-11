import React, { PureComponent } from 'react';
import classNames from 'classnames';

import style from './meta.pcss';

export class Meta extends PureComponent {
    SCHEME = [
        {
            name: 'title',
            className: style.title,
            format: null,
            label: null,
        },
        {
            name: 'type',
            className: style.row,
            format: null,
            label: 'Тип',
        },
        {
            name: 'part',
            className: style.row,
            format: '{current} из {total}',
            label: 'Пакет',
        },
        {
            name: 'page',
            className: style.row,
            format: '{current} из {total}',
            label: 'Лист',
        },
        {
            name: 'developer',
            className: style.row,
            format: null,
            label: 'Разработчик',
        },
        {
            name: 'vendor',
            className: style.row,
            format: null,
            label: 'Организация',
        },
        {
            name: 'totalConsumption',
            className: style.row,
            format: null,
            label: 'Заготовки (шт.)',
        },
        {
            name: 'totalWaste',
            className: style.row,
            format: null,
            label: 'Отходы (мм.)',
        },
    ];

    getFormattedLabel = label => (label ? `${label}: ` : null);

    getFormattedValue = (format, value) => {
        if (format === null) return value;
        return format.replace(/{(\w+)}/g, (_, key) => value[key]);
    };

    render() {
        return (
            <div className={classNames(style.container, this.props.className)}>
                {this.SCHEME.map(({ name, className, format, label }) => {
                    const value = this.props.meta[name];
                    if (typeof value === 'undefined') return null;
                    return (
                        <div className={className} key={name}>
                            {this.getFormattedLabel(label)}
                            {this.getFormattedValue(format, value)}
                        </div>
                    );
                })}
            </div>
        );
    }
}
