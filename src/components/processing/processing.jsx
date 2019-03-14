import React, { Component, Fragment } from 'react';

import { Section } from '../section/section';
import { Meta } from '../preview/meta/meta';
import { Preview } from '../preview/preview';

import Core from './processing.worker';
import style from './processing.pcss';

export class Processing extends Component {
    STEPS = {
        1: 'Установка параметров: Длина заготовки.',
        2: 'Установка параметров: Ширина режущей кромки.',
        3: 'Установка параметров: Точность расчетов.',
        4: 'Работа: Оптимизация структуры данных.',
        5: 'Работа: Выстраивание оптимальных последовательностей.',
        6: 'Работа: Группировка повторяющихся последовательностей.',
        7: 'Работа: Дополнение структуры данных в последовательностях.',
        8: 'Готово.',
        9: 'Анализ: Сбор информации о затратах материала.',
        10: 'Готово.',
    };

    workers = [];

    componentDidUpdate(previousProps) {
        const {
            data: { uploading: currentUploadingData },
            active: currentActivityStatus,
        } = this.props;
        const {
            data: { uploading: previousUploadingData },
            active: previousActivityStatus,
        } = previousProps;
        const isFileUploaded = currentUploadingData !== null && previousUploadingData === null;
        const isStepReopened = !currentActivityStatus && previousActivityStatus;
        if (isFileUploaded || isStepReopened) this.setState(this.createInitialFileEntities());
    }

    createInitialFileEntities = () => {
        const result = {};
        this.props.data.uploading.forEach((_, id) => {
            result[id] = {
                phase: 0,
                status: null,
                calculations: null,
                analysis: null,
                isPreviewVisible: false,
            };
        });
        return result;
    };

    getFileEntityByID = id => this.props.data.uploading[id];

    getCalculationParameters = () => this.props.data.parametrization;

    updateFileEntityInState = (id, updates, callback = () => {}) => {
        this.setState(({ [id]: restFields }) => ({ [id]: { ...restFields, ...updates } }), callback);
    };

    handleCalculationsCoreMessages = (id, { label, data }) => {
        const { status: lastMessage } = this.state;
        switch (label) {
            case 'status': {
                this.updateFileEntityInState(id, { status: this.STEPS[data] });
                break;
            }
            case 'error': {
                this.updateFileEntityInState(id, { phase: 0, status: lastMessage });
                break;
            }
            case 'calculations': {
                this.updateFileEntityInState(id, { calculations: data });
                break;
            }
            case 'analysis': {
                this.updateFileEntityInState(id, { phase: 2, analysis: data });
                break;
            }
            default: {
                console.error('Unknown message label received');
                break;
            }
        }
    };

    createCalculationsCoreInstance = id => () => {
        const {
            content: { blueprints },
        } = this.getFileEntityByID(id);

        const { assetLength, calculationAccuracy, cuttingEdge } = this.getCalculationParameters();
        const worker = new Core();
        worker.addEventListener('message', ({ data }) => {
            this.handleCalculationsCoreMessages(id, data);
        });
        worker.postMessage({
            label: 'run',
            blueprints,
            assetLength,
            calculationAccuracy,
            cuttingEdge,
        });
        this.workers.push(worker);
    };

    runCoreCalculations = id => () => {
        this.updateFileEntityInState(id, { phase: 1 }, this.createCalculationsCoreInstance(id));
    };

    showPreview = id => () => {
        this.updateFileEntityInState(id, { isPreviewVisible: true });
    };

    hidePreview = id => () => {
        this.updateFileEntityInState(id, { isPreviewVisible: false });
    };

    onBack = () => {
        this.workers.forEach(worker => worker.terminate());
        this.props.onBack();
    };

    PHASES = {
        0: {
            disabled: false,
            handler: this.runCoreCalculations,
            content: 'Расчитать',
        },
        1: {
            disabled: true,
            handler: null,
            content: 'Расчет...',
        },
        2: {
            disabled: false,
            handler: this.showPreview,
            content: 'Просмотр',
        },
    };

    render() {
        const {
            active,
            passed,
            data: { uploading, parametrization },
        } = this.props;

        return (
            <Section
                active={active}
                passed={passed}
                onBack={this.onBack}
                title={
                    <Fragment>
                        <b>Шаг №3</b>: Рассчитайте и распечатайте результат.
                    </Fragment>
                }
            >
                {() =>
                    uploading.map((file, id) => {
                        const {
                            name,
                            size,
                            content: { meta },
                        } = file;
                        const { phase, status, isPreviewVisible, calculations, analysis } = this.state[id];
                        const { disabled, handler, content } = this.PHASES[phase];
                        const interactiveAttributes = handler === null ? {} : { onClick: handler(id) };

                        return (
                            <div className={style.container} key={id}>
                                <Meta meta={meta} />
                                <div className={style.controls}>
                                    <span className={style.name}>
                                        Имя файла: <b>{name}</b>
                                    </span>
                                    <span className={style.size}>
                                        Размер файла: <b>{Math.round(size / 1024)}kb</b>
                                    </span>
                                    {status && <span className={style.status}>{status}</span>}
                                    <button className="button" disabled={disabled} {...interactiveAttributes}>
                                        {content}
                                    </button>
                                </div>
                                {isPreviewVisible ? (
                                    <Preview
                                        {...parametrization}
                                        onClose={this.hidePreview(id)}
                                        blueprints={calculations}
                                        meta={{ ...meta, ...analysis }}
                                    />
                                ) : null}
                            </div>
                        );
                    })
                }
            </Section>
        );
    }
}
