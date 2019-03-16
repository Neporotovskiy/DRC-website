import React from 'react';
import classNames from 'classnames';

import { Shade } from '../shade/shade';

import style from './edge.pcss';

export const Edge = ({ type, visible }) => {
    if (!visible) return null;
    return <Shade className={classNames(style.edge, style[type])} width={15} height={40} />;
};
