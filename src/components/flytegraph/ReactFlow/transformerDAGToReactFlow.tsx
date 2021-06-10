import { dEdge, dNode, dTypes } from 'models/Graph/types';
import { RFEntity } from './types';
import { MAX_RENDER_DEPTH, ReactFlowGraphConfig } from './utils';

export const buildCustomNodeName = (type: dTypes) => {
    return `${ReactFlowGraphConfig.customNodePrefix}_${dTypes[type]}`;
};

export const buildReactFlowEdge = (edge: dEdge): RFEntity => {
    return {
        id: `[${edge.sourceId}]->[${edge.targetId}]`,
        source: edge.sourceId,
        target: edge.targetId,
        sourceHandle: 'left-handle',
        arrowHeadType: ReactFlowGraphConfig.arrowHeadType,
        type: ReactFlowGraphConfig.edgeType
    } as RFEntity;
};

export const buildReactFlowNode = (
    dNode: dNode,
    dag = [],
    typeOverride?: dTypes
): RFEntity => {
    const type = typeOverride ? typeOverride : dNode.type;
    let taskType = dNode?.value?.template ? dNode.value.template.type : null;

    return {
        id: dNode.id,
        type: buildCustomNodeName(type),
        data: {
            text: dNode.name,
            handles: [],
            nodeType: type,
            dag: dag,
            taskType: taskType
        },
        position: { x: 0, y: 0 },
        sourcePosition: '',
        targetPosition: ''
    } as RFEntity;
};

export const nodeMapToArr = map => {
    const output = [];
    for (const k in map) {
        output.push(map[k]);
    }
    return output;
};

export const dagToReactFlow = (dag: dNode, currentDepth = 0) => {
    const nodes = {};
    const edges = [];
    dag.nodes?.map(dNode => {
        if (dNode.nodes?.length > 0 && currentDepth <= MAX_RENDER_DEPTH) {
            if (currentDepth == MAX_RENDER_DEPTH) {
                nodes[dNode.id] = buildReactFlowNode(
                    dNode,
                    [],
                    dTypes.nestedMaxDepth
                );
            } else {
                nodes[dNode.id] = buildReactFlowNode(
                    dNode,
                    dagToReactFlow(dNode, currentDepth + 1)
                );
            }
        } else {
            nodes[dNode.id] = buildReactFlowNode(dNode);
        }
    });
    dag.edges?.map(edge => {
        edges.push(buildReactFlowEdge(edge));
    });
    const output = nodeMapToArr(nodes).concat(edges);
    return output;
};

export const ConvertFlyteDagToReactFlows = (root: dNode): RFEntity[] => {
    const rfJson = dagToReactFlow(root);
    console.log('@ConvertFlyteDagToReactFlows: =>', rfJson);
    return rfJson;
};
