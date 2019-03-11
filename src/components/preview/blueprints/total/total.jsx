import React from 'react';
import style from './total.pcss';

export const Total = ({ children }) => {
    return (
        <div className={style.total}>
            <div className={style.end} />
            <div className={style.line} />
            <div className={style.content}>{children}</div>
            <div className={style.end} />
        </div>
    );
};
