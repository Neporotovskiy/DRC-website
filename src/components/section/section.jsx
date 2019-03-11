import React from 'react';
import classNames from 'classnames';

import { Title } from '../title/title';

import style from './section.pcss';

export const Section = ({ active, passed, valid, onContinue, onBack, title, unmountCallback, children }) => {
    if (active) {
        const isChildExecutable = typeof children === 'function';
        return (
            <section className={style.section}>
                <Title>{title}</Title>
                {isChildExecutable ? children() : children}
                <div className={style.buttons}>
                    {typeof onBack === 'function' ? (
                        <button onClick={onBack} className={classNames('button', style.back)}>
                            Назад
                        </button>
                    ) : null}
                    {typeof onContinue === 'function' ? (
                        <button disabled={!valid} onClick={onContinue} className={classNames('button', style.continue)}>
                            Сохранить
                        </button>
                    ) : null}
                </div>
            </section>
        );
    }
    return (
        <section className={style.section}>
            <Title inactive={!passed}>{title}</Title>
        </section>
    );
};
