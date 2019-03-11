import React from 'react';
import classNames from 'classnames';

import { Shade } from '../shade/shade';

import style from './grooves.pcss';

export const Grooves = ({ sides, label}) => {
    const [top, bottom] = sides;
    const sizes = { width: 13, height: 10 };
    return (
        <div className={style.grooves}>
            <Shade className={classNames(style.groove, style.top, { [style.visible]: top })} {...sizes} />
            <div className={style.label}>{label}</div>
            <Shade className={classNames(style.groove, style.bottom, { [style.visible]: bottom })} {...sizes} />
        </div>
    );
};
