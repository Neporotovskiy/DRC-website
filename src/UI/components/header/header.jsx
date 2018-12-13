import React from 'react';

import s from './header.pcss';

export const Header = () => {
    return (
        <header className={s.header}>
            <div className={s.content}>
                <h3 className={s.version}>
                    <b>1.0.0</b>
                </h3>
            </div>
        </header>
    );
};
