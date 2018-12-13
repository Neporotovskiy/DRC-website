import React from 'react';
import classNames from 'classnames';

import s from './title.pcss';

export const Title = ({ children, inactive }) => <h2 className={classNames(s.title, { [s.inactive]: inactive })}>{children}</h2>;
