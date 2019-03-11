import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import { Header } from '../header/header';
import { Blueprints } from '../preview/blueprints/blueprints';
import { Meta } from '../preview/meta/meta';

import style from './preview.pcss';

export class Preview extends Component {
    componentDidMount() {
        this.application = document.getElementById('application-mounting-point');
        this.application.classList.add(style.hidden);
    }

    componentWillUnmount() {
        this.application.classList.remove(style.hidden);
    }

    print = () => {
        window.print();
    };

    close = () => {
        this.application.classList.remove(style.hidden);
        this.props.onClose();
    };

    render() {
        const { blueprints, meta, ...rest } = this.props;
        return ReactDOM.createPortal(
            <Fragment>
                <Header className={style.header}>
                    <button className={classNames('button', style.button)} onClick={this.print}>
                        Печать
                    </button>
                    <button className={classNames('button', style.button)} onClick={this.close}>
                        Назад
                    </button>
                </Header>
                <div className={style.preview}>
                    <Blueprints blueprints={blueprints} {...rest} />
                    <Meta meta={meta} {...rest} className={style.meta} />
                </div>
            </Fragment>,
            document.getElementById('preview-mounting-point'),
        );
    }
}
