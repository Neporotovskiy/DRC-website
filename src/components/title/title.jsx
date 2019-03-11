import React from 'react';
import classNames from 'classnames';

import style from './title.pcss';

export const Title = ({ children, inactive }) => (
    <h2 className={classNames(style.title, { [style.inactive]: inactive })}>{children}</h2>
);
