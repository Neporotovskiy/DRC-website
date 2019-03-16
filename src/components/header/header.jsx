import React from 'react';
import classNames from 'classnames';

import style from './header.pcss';

export const Header = ({ children, className }) => {
    return (
        <header className={classNames(style.header, className)}>
            <div className={style.content}>
                <h3 className={style.version}>
                    <b>1.1.0</b>
                </h3>
                <div>{children}</div>
            </div>
        </header>
    );
};
