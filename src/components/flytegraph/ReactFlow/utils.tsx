import { dTypes } from 'models/Graph/types';
import { isNode } from 'react-flow-renderer';
import { RFBackgroundProps, RFEntity } from './types';

const dagre = require('dagre');

export const DISPLAY_NAME_START = 'start';
export const DISPLAY_NAME_END = 'end';
export const MAX_RENDER_DEPTH = 1;
export const HANDLE_ICON = require('assets/SmallArrow.svg') as string;
export const COLOR_DEFAULT_V1 = '#6c5bd2';

export const ReactFlowGraphConfig = {
    customNodePrefix: 'FlyteNode',
    arrowHeadType: 'arrowClosed',
    edgeType: 'default'
};

export const getGraphHandleStyle = (
    handleType: string,
    type?: dTypes
): object => {
    let size = 8;
    const offset = 10;

    let backgroundColor = `rgba(255,255,255,1)`;
    let marginLeft,
        marginRight = 0;

    if (handleType == 'target') {
        marginLeft = 0;
        marginRight = -offset;
    } else if (handleType == 'source') {
        marginRight = 0;
        marginLeft = -offset;
    } else if (handleType == 'nestedPoint') {
        backgroundColor = 'none';
        size = 1;
    }

    const baseStyle = {
        zIndex: 99999999,
        marginLeft: `${marginLeft}px`,
        marginRight: `${marginRight}px`,
        width: `${size}px`,
        height: `${size}px`,
        background: backgroundColor,
        backgroundImage: `url(${HANDLE_ICON})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        border: 'none'
    };

    /**
     * @TODO Keeping this for future
     * */
    const overrideStyles = {
        nestedMaxDepth: {
            background: 'none',
            backgroundImage: 'none'
        }
    };

    if (type) {
        const key = String(dTypes[type]);
        const output = {
            ...baseStyle,
            ...overrideStyles[key]
        };
        return output;
    } else {
        return baseStyle;
    }
};

export const getGraphNodeStyle = (type: dTypes): object => {
    /** Base styles for displaying graph nodes */
    const baseStyle = {
        boxShadow: '1px 3px 5px rgba(0,0,0,.2)',
        padding: '.25rem .75rem',
        fontSize: '.6rem',
        color: '#323232',
        borderRadius: '.25rem',
        border: '.15rem solid #555',
        background: '#fff',
        minWidth: '.5rem',
        minHeight: '.5rem',
        height: 'auto',
        width: 'auto'
    };

    const nestedPoint = {
        width: '1px',
        height: '1px',
        minWidth: '1px',
        minHeight: '1px',
        padding: 0,
        boxShadow: 'none',
        border: 'none',
        background: 'none',
        borderRadius: 'none',
        color: '#fff'
    };

    /** Override the base styles with node-type specific styles */
    const overrideStyles = {
        start: {
            border: '1px solid #ddd'
        },
        end: {
            border: '1px solid #ddd'
        },
        nestedStart: {
            ...nestedPoint
        },
        nestedEnd: {
            ...nestedPoint
        },
        nestedWithChildren: {
            borderColor: COLOR_DEFAULT_V1
        },
        nestedMaxDepth: {
            background: COLOR_DEFAULT_V1,
            color: 'white',
            border: 'none'
        },
        branch: {
            display: 'flex',
            flexAlign: 'center',
            border: 'none',
            background: COLOR_DEFAULT_V1,
            borderRadius: '0px',
            padding: '1rem 0',
            boxShadow: 'none',
            fontSize: '.6rem',
            color: '#efefef'
        },
        workflow: {
            borderColor: COLOR_DEFAULT_V1
        },
        task: {
            borderColor: COLOR_DEFAULT_V1
        }
    };
    const key = String(dTypes[type]);
    const output = {
        ...baseStyle,
        ...overrideStyles[key]
    };
    return output;
};

export const rfBackground = {
    main: {
        background: {
            border: '1px solid #444',
            backgroundColor: 'rgba(255,255,255,1)'
        },
        gridColor: '#ccc',
        gridSpacing: 20
    } as RFBackgroundProps,
    nested: {
        background: {
            border: `1px dashed ${COLOR_DEFAULT_V1}`,
            borderRadius: '10px',
            background: 'rgba(255,255,255,1)',
            padding: 0,
            margin: 0
        },
        gridColor: 'none',
        gridSpacing: 1
    } as RFBackgroundProps
};

/**
 * Uses dagree/graphlib to compute graph layout
 * @see https://github.com/dagrejs/dagre/wiki
 * @param elements      Graph elements (nodes/edges) in JSON format
 * @param direction     Direction to render graph
 * @returns
 */
export const setReactFlowGraphLayout = (
    elements: RFEntity[],
    direction: string
) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    const isHorizontal = direction === 'LR';

    dagreGraph.setGraph({
        rankdir: direction,
        edgesep: 20,
        nodesep: 40,
        ranker: 'longest-path',
        acyclicer: 'greedy'
    });

    /**
     * Note: this waits/assumes rendered dimensions from ReactFlow as .__rf
     */
    elements.forEach(el => {
        if (isNode(el)) {
            const nodeWidth = el.__rf.width;
            const nodeHeight = el.__rf.height;
            dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
        } else {
            dagreGraph.setEdge(el.source, el.target);
        }
    });

    dagre.layout(dagreGraph);

    return elements.map(el => {
        if (isNode(el)) {
            el.targetPosition = isHorizontal ? 'left' : 'top';
            el.sourcePosition = isHorizontal ? 'right' : 'bottom';
            const nodeWidth = el.__rf.width;
            const nodeHeight = el.__rf.height;
            const nodeWithPosition = dagreGraph.node(el.id);

            /** Keep both position and .__rf.position in sync */
            const x = nodeWithPosition.x - nodeWidth / 2;
            const y = nodeWithPosition.y - nodeHeight / 2;
            el.position = {
                x: x,
                y: y
            };
            el.__rf.position = {
                x: x,
                y: y
            };
        }
        return el;
    });
};

export default setReactFlowGraphLayout;
