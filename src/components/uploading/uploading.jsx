import React, { PureComponent, Fragment } from 'react';
import classNames from 'classnames';

import { Section } from '../section/section';

import style from './uploading.pcss';

export class Uploading extends PureComponent {
    state = {
        files: [],
        valid: false,
        dropPointStyle: null,
    };

    componentDidUpdate() {
        const { files, valid } = this.state;
        const atLeastOneFileIsUploaded = files.length > 0;
        const allUploadedFilesIsProcessable = files.every(file => file.processable);
        const isStepValid = atLeastOneFileIsUploaded && allUploadedFilesIsProcessable;
        const isActualData = valid !== isStepValid;
        if (isActualData) this.setState({ valid: isStepValid });
    }

    onEnterHandler = event => {
        event.stopPropagation();
        event.preventDefault();
    };

    onOverHandler = event => {
        event.stopPropagation();
        event.preventDefault();
        this.setState({ dropPointStyle: style.hovered });
    };

    onLeaveHandler = event => {
        event.stopPropagation();
        event.preventDefault();
        this.setState({ dropPointStyle: null });
    };

    onDropHandler = event => {
        event.stopPropagation();
        event.preventDefault();
        this.setState({ dropPointStyle: null });

        this.renderFileItems(event.dataTransfer.files);
    };

    onInputFieldClearHandler = event => (event.target.value = null);

    onInputValueChangeHandler = event => {
        this.renderFileItems(event.target.files);
    };

    makeFileListIterable = fileList => {
        const result = [];
        for (let i = 0; i <= fileList.length; i++) {
            const file = fileList.item(i);
            if (file) result.push(file);
        }
        return result;
    };

    renderFileItems = files => {
        const result = [];
        this.makeFileListIterable(files).forEach(file => {
            if (this.isFileAlreadyUploaded(this.state.files, file.name, file.size)) return;
            this.readFileContent(file, (content, processable) => {
                result.push({
                    name: file.name,
                    size: file.size,
                    content,
                    processable,
                });
                if (result.length === files.length) {
                    this.setState({ files: this.state.files.concat(result) });
                }
            });
        });
    };

    isFileAlreadyUploaded = (files, fileName, fileSize) =>
        files.some(file => {
            const isNameSame = file.name === fileName;
            const isSizeSame = file.size === fileSize;
            return isNameSame && isSizeSame;
        });

    readFileContent = (file, callback) => {
        if (file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = ({ target }) => {
                const contentStructure = JSON.parse(target.result);
                if (['meta', 'blueprints'].every(field => field in contentStructure)) {
                    callback(contentStructure, true);
                } else {
                    callback(null, false);
                }
            };
            reader.readAsText(file, 'UTF-8');
        } else {
            callback(null, false);
        }
    };

    removeFile = name => () => {
        this.setState({
            files: this.state.files.filter(file => file.name !== name),
        });
    };

    onContinue = () => {
        const { files, valid } = this.state;
        const { onContinue } = this.props;
        if (valid) onContinue(files);
    };

    render() {
        const { files, dropPointStyle, valid } = this.state;
        const { active, passed } = this.props;

        return (
            <Section
                active={active}
                passed={passed}
                valid={valid}
                onContinue={this.onContinue}
                title={
                    <Fragment>
                        <b>Шаг №1</b>: Выберите подготовленный <b>.json</b> файл.
                    </Fragment>
                }
            >
                <p>Поместите файл(ы) в область ниже, или кликните по ней для вызова окна выбора файла.</p>
                <input
                    type="file"
                    id={style.filesTarget}
                    multiple
                    hidden
                    onChange={this.onInputValueChangeHandler}
                    onClick={this.onInputFieldClearHandler}
                />
                <label
                    htmlFor={style.filesTarget}
                    className={classNames(style.filesSelector, dropPointStyle)}
                    onDragEnter={this.onEnterHandler}
                    onDragOver={this.onOverHandler}
                    onDragLeave={this.onLeaveHandler}
                    onDrop={this.onDropHandler}
                >
                    Перетащите или выберите файлы
                </label>
                {files.length > 0 ? (
                    <ul className={style.uploadedFiles}>
                        {files.map(({ name, size, processable }) => (
                            <li
                                className={style.fileItem}
                                title={
                                    processable
                                        ? name
                                        : 'Данный файл содержит некорректную структуру содержимого или необрабатываемый MIME-тип и не будет использован'
                                }
                                key={name}
                            >
                                <b className={classNames(style.name, { [style.processable]: processable })}>{name}</b>
                                <b className={style.size}>{Math.ceil(size / 1024)}</b>
                                <span className={style.removeButton} onClick={this.removeFile(name)} />
                            </li>
                        ))}
                    </ul>
                ) : null}
            </Section>
        );
    }
}
