import React from 'react';
import classNames from 'classnames';

import style from './shade.pcss';

export const Shade = ({className, width = 10, height = 10}) => {
    const diagonal = Math.floor(Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)));
    const angle = Math.round(Math.atan(height / width) * 180 / Math.PI);
    const containerStyles = {width: `${width}px`, height: `${height}px`};
    return (
        <div className={classNames(style.shade, className)} style={containerStyles}>
            <div className={style.leftToRight} style={{width: diagonal, transform: `rotate(${angle}deg)`}}/>
            <div className={style.rightToLeft} style={{width: diagonal, transform: `rotate(${-angle}deg)`}}/>
        </div>
    );
};
