import React, { PureComponent } from 'react';
import classNames from 'classnames';

import { Title } from '../title/title';

import s from './uploading.pcss';

export class Uploading extends PureComponent {
    state = {
        files: [],
        dropPointStyle: null,
    };

    onEnterHandler = event => {
        event.stopPropagation();
        event.preventDefault();
    };

    onOverHandler = event => {
        event.stopPropagation();
        event.preventDefault();
        this.setState({ dropPointStyle: s.hovered });
    };

    onLeaveHandler = event => {
        event.stopPropagation();
        event.preventDefault();
        this.setState({ dropPointStyle: s.leaved });
    };

    onDropHandler = event => {
        event.stopPropagation();
        event.preventDefault();
        this.setState({ dropPointStyle: s.leaved });

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

    renderFileItems = (files, clear) => {
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
                    const files = this.state.files.concat(result);
                    this.setState({ files }, this.props.continue(0, files.filter(file => file.processable)));
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
                if (contentStructure.data) {
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
        this.setState(
            {
                files: this.state.files.filter(file => file.name !== name),
            },
            () => {
                this.props.continue(0, this.state.files.filter(file => file.processable))();
            },
        );
    };

    render() {
        const { files, dropPointStyle } = this.state;

        return (
            <section>
                <Title>
                    <b>Шаг №1</b>: Выберите подготовленный <b>.json</b> файл.
                </Title>
                <p>Поместите файл(ы) в область ниже, или кликните по ней для вызова окна выбора файла.</p>
                <input
                    type="file"
                    id={s.filesTarget}
                    multiple
                    hidden
                    onChange={this.onInputValueChangeHandler}
                    onClick={this.onInputFieldClearHandler}
                />
                <label
                    htmlFor={s.filesTarget}
                    className={classNames(s.filesSelector, dropPointStyle)}
                    onDragEnter={this.onEnterHandler}
                    onDragOver={this.onOverHandler}
                    onDragLeave={this.onLeaveHandler}
                    onDrop={this.onDropHandler}
                >
                    Перетащите или выберите файлы
                </label>
                {files.length > 0 ? (
                    <ul className={s.uploadedFiles}>
                        {files.map(({ name, size, processable }) => (
                            <li
                                className={s.fileItem}
                                title={
                                    processable
                                        ? name
                                        : 'Данный файл содержит некорректную структуру содержимого или необрабатываемый MIME-тип и не будет использован'
                                }
                                key={name}
                            >
                                <b className={classNames(s.name, { [s.processable]: processable })}>{name}</b>
                                <b className={s.size}>{Math.ceil(size / 1024)}</b>
                                <span className={s.removeButton} onClick={this.removeFile(name)} />
                            </li>
                        ))}
                    </ul>
                ) : null}
            </section>
        );
    }
}
