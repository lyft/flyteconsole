import { CompiledNode } from 'models/Node/types';

/* Types of nodes */
export enum dTypes {
    task,
    primary,
    branch,
    subworkflow,
    start,
    end,
    nestedEnd,
    nestedStart,
    nestedMaxDepth
}

/**
 * DAG edge
 * @sourceId    dNode.id
 * @targetId    dNode.id
 */
export interface dEdge {
    sourceId: string;
    targetId: string;
}

/**
 * DAG node
 * @id      used for mapping edges
 * @type    determines which UX component to render
 * @name    for display in UX
 * @value   flyte node data bound to this node
 * @nodes   children
 * @edges   edges
 */
export interface dNode {
    id: string;
    type: dTypes;
    name: string;
    value?: CompiledNode;
    nodes: Array<dNode>;
    edges: Array<dEdge>;
}
