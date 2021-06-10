import * as React from 'react';
import { Handle, getBezierPath, getMarkerEnd } from 'react-flow-renderer';
import { dTypes } from 'models/Graph/types';
import { ReactFlowWrapper } from './ReactFlowWrapper';
import {
    COLOR_DEFAULT_V1,
    getGraphHandleStyle,
    getGraphNodeStyle,
    rfBackground
} from './utils';
import { RFGraphTypes } from './types';

export const customEdge = (
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    arrowHeadType,
    markerEndId
) => {
    const edgePath = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition
    });
    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

    return (
        <>
            <path
                id={id}
                style={style}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
            />
        </>
    );
};

/**
 * Custom component renders node as a point; used for nested workflows
 * @param props.data data property of ReactFlowGraphNodeData
 */

export const ReactFlowCustomNestedPoint = ({ data }: any) => {
    const containerStyle = getGraphNodeStyle(data.nodeType);
    const isStart = data.nodeType == dTypes.nestedStart;
    const position = isStart ? 'right' : 'left';
    const type = 'nestedPoint';
    const id = isStart ? 'start' : 'end';
    const handleStyle = getGraphHandleStyle(type, dTypes.nestedMaxDepth);
    return (
        <>
            <div style={containerStyle} />
            <Handle
                id={`cnn-${id}-${data.text}`}
                type={type}
                position={position}
                style={handleStyle}
            />
        </>
    );
};

/**
 * Custom component used as a stop gap until we support fully nested
 * workflows; renders nested data (branch/workflow) as a single node
 * denoted by solid color.
 * @param props.data data property of ReactFlowGraphNodeData
 */

export const ReactFlowCustomMaxNested = ({ data }: any) => {
    const styles = getGraphNodeStyle(dTypes.nestedMaxDepth);
    const sourceHandle = getGraphHandleStyle('source', dTypes.nestedMaxDepth);
    const targetHandle = getGraphHandleStyle('target', dTypes.nestedMaxDepth);

    const containerStyle = {};
    const taskContainerStyle = {
        position: 'absolute',
        top: '-.55rem',
        zIndex: '-1',
        right: '.15rem'
    };
    const taskTypeStyle = {
        backgroundColor: COLOR_DEFAULT_V1,
        color: 'white',
        padding: '.1rem .2rem',
        fontSize: '.3rem'
    };

    const renderTaskType = () => {
        return (
            <div style={taskContainerStyle}>
                <div style={taskTypeStyle}>{data.taskType}</div>
            </div>
        );
    };

    return (
        <div style={containerStyle}>
            {data.taskType ? renderTaskType() : null}
            <div style={styles}>{data.text}</div>
            <Handle
                id={`cnt-left-${data.text}`}
                type="target"
                position="left"
                style={targetHandle}
            />
            <Handle
                id={`cnt-right-${data.text}`}
                type="source"
                position="right"
                style={sourceHandle}
            />
        </div>
    );
};

/**
 * Custom component used by ReactFlow.  Renders a label (text)
 * and any edge handles.
 * @param props.data data property of ReactFlowGraphNodeData
 */

export const ReactFlowCustomTaskNode = ({ data }: any) => {
    const styles = getGraphNodeStyle(data.nodeType);
    const sourceHandle = getGraphHandleStyle('source');
    const targetHandle = getGraphHandleStyle('target');

    const containerStyle = {};
    const taskContainerStyle = {
        position: 'absolute',
        top: '-.55rem',
        zIndex: '-1',
        right: '.15rem'
    };
    const taskTypeStyle = {
        backgroundColor: COLOR_DEFAULT_V1,
        color: 'white',
        padding: '.1rem .2rem',
        fontSize: '.3rem'
    };

    const renderTaskType = () => {
        return (
            <div style={taskContainerStyle}>
                <div style={taskTypeStyle}>{data.taskType}</div>
            </div>
        );
    };

    return (
        <div style={containerStyle}>
            {data.taskType ? renderTaskType() : null}
            <div style={styles}>{data.text}</div>
            <Handle
                id={`cnt-left-${data.text}`}
                type="target"
                position="left"
                style={targetHandle}
            />
            <Handle
                id={`cnt-right-${data.text}`}
                type="source"
                position="right"
                style={sourceHandle}
            />
        </div>
    );
};

/**
 * Custom component renders subworkflows as indepdenet flow
 * and any edge handles.
 * @param props.data data property of ReactFlowGraphNodeData
 */
export const ReactFlowCustomSubworkflowNode = ({ data }: any) => {
    const sourceHandle = getGraphHandleStyle('source');
    const targetHandle = getGraphHandleStyle('target');
    const { dag } = data;
    const backgroundStyle = rfBackground.nested;

    const rfContainerStyle = {
        width: `300px`,
        height: `200px`
    };

    return (
        <>
            <Handle
                id={`bcn-left-${data.text}`}
                type="target"
                position="left"
                style={targetHandle}
            />
            <Handle
                id={`bcn-right-${data.text}`}
                type="source"
                position="right"
                style={sourceHandle}
            />
            <div style={rfContainerStyle}>
                <ReactFlowWrapper
                    rfGraphJson={dag}
                    backgroundStyle={backgroundStyle}
                    type={RFGraphTypes.nested}
                />
            </div>
        </>
    );
};

/**
 * Custom component renders Branch nodes as indepdenet flow
 * and any edge handles.
 * @param props.data data property of ReactFlowGraphNodeData
 */
export const ReactFlowCustomBranchNode = ({ data }: any) => {
    const sourceHandle = getGraphHandleStyle('source');
    const targetHandle = getGraphHandleStyle('target');
    const { dag } = data;
    const backgroundStyle = rfBackground.nested;

    const rfContainerStyle = {
        width: `300px`,
        height: `200px`
    };

    return (
        <>
            <Handle
                id={`bcn-left-${data.text}`}
                type="target"
                position="left"
                style={targetHandle}
            />
            <Handle
                id={`bcn-right-${data.text}`}
                type="source"
                position="right"
                style={sourceHandle}
            />
            <div style={rfContainerStyle}>
                <ReactFlowWrapper
                    rfGraphJson={dag}
                    backgroundStyle={backgroundStyle}
                    type={RFGraphTypes.nested}
                />
            </div>
        </>
    );
};

/**
 * Custom component renders start node
 * @param props.data data property of ReactFlowGraphNodeData
 */
export const ReactFlowCustomStartNode = ({ data }: any) => {
    const styles = getGraphNodeStyle(data.nodeType);
    const handleStyle = getGraphHandleStyle('source');
    return (
        <>
            <div style={styles}>{data.text}</div>
            <Handle type="source" position="right" style={handleStyle} />
        </>
    );
};

/**
 * Custom component renders start node
 * @param props.data data property of ReactFlowGraphNodeData
 */
export const ReactFlowCustomEndNode = ({ data }: any) => {
    const styles = getGraphNodeStyle(data.nodeType);
    const handleStyle = getGraphHandleStyle('target');
    return (
        <>
            <div style={styles}>{data.text}</div>
            <Handle type="target" position="left" style={handleStyle} />
        </>
    );
};
