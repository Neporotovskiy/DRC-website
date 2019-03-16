import React, { Component } from 'react';
import classNames from 'classnames';

import { Total } from './total/total';
import { Edge } from './edge/edge';
import { Grooves } from './grooves/grooves';

import style from './blueprints.pcss';

/*
BLUEPRINTS SET EXAMPLE

[
    {
        length: 5500,
        edges: [0, 0], // right, left
        milestones: { // right to left
            468: [1, 1], // top, bottom
            4768: [1, 1],
        },
        mark: 57,
        number: 6,
        notes: null,
    },
]
*/

export class Blueprints extends Component {
    getPercent = (total, part) => Math.floor(part / (total * 0.01));

    getBlockLength = length => ({
        width: `${this.getPercent(this.props.assetLength, length)}%`,
    });

    getMilestonePosition = (length, position) => ({
        right: `${this.getPercent(length, position)}%`,
    });

    render() {
        const { blueprints, assetLength, className } = this.props;
        return (
            <div className={classNames(style.container, className)}>
                {blueprints.map(({ group, number }, id) => {
                    return (
                        <div className={style.wrapper} key={id}>
                            <Total>{`${assetLength} x ${number}`}</Total>
                            <div className={style.blueprints}>
                                {group.map(
                                    (
                                        {
                                            length,
                                            edges: [isRightEdgeVisible, isLeftEdgeVisible],
                                            milestones,
                                            notes,
                                            mark,
                                            number,
                                        },
                                        id,
                                    ) => {
                                        return (
                                            <div
                                                className={style.blueprint}
                                                key={id}
                                                style={this.getBlockLength(length)}
                                            >
                                                <Total>{length}</Total>
                                                <div className={style.body}>
                                                    <Edge type="left" visible={isLeftEdgeVisible} />
                                                    {Object.keys(milestones).map((milestone, id) => (
                                                        <div
                                                            className={style.milestone}
                                                            key={id}
                                                            style={this.getMilestonePosition(length, milestone)}
                                                        >
                                                            <Grooves
                                                                sides={milestones[milestone]}
                                                                label={milestone}
                                                            />
                                                        </div>
                                                    ))}
                                                    <Edge type="right" visible={isRightEdgeVisible} />
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}
