import {
    DISPLAY_NAME_END,
    DISPLAY_NAME_START
} from 'components/flytegraph/ReactFlow/utils';
import { dTypes, dEdge, dNode } from 'models/Graph/types';
import { startNodeId, endNodeId } from 'models/Node/constants';
import { CompiledNode, ConnectionSet } from 'models/Node/types';
import { TaskTemplate } from 'models/Task/types';
import {
    CompiledWorkflow,
    CompiledWorkflowClosure,
    WorkflowTemplate
} from 'models/Workflow/types';
import {
    isEndNode,
    isStartNode,
    createId,
    getDisplayName,
    getId,
    getSubWorkflowFromId,
    getNodeTypeFromCompiledNode,
    getTaskTypeFromCompiledNode
} from './utils';

/**
 * Returns a DAG from Flyte workflow request data
 * @param context input can be either CompiledWorkflow or CompiledNode
 * @returns Display name
 */
export const transformerWorkflowToDAG = (
    workflow: CompiledWorkflowClosure
): dNode => {
    const { primary } = workflow;
    console.log('@transformerWorkflowToDAG: input=>workflow', workflow);
    const root = buildDAG(null, primary, dTypes.primary, workflow);
    return root;
};

const createDNode = (
    compiledNode: CompiledNode,
    workflowTemplate: WorkflowTemplate,
    taskTemplate?: TaskTemplate,
    typeOverride?: dType
): dNode => {
    const nodeValue =
        taskTemplate == null
            ? compiledNode
            : { ...compiledNode, ...taskTemplate };

    /**
     * @TODO decide if we want to nested/standard start/end in
     *       UX; saving untilthat is decided.
     */
    // const type =
    //     typeOverride == null
    //         ? getNodeTypeFromCompiledNode(compiledNode)
    //         : typeOverride;

    const output = {
        id: createId(workflowTemplate, compiledNode.id),
        value: nodeValue,
        type: getNodeTypeFromCompiledNode(compiledNode),
        name: getDisplayName(compiledNode),
        nodes: [],
        edges: []
    } as dNode;
    return output;
};

export const buildBranchStartEndNodes = (root: dNode) => {
    const startNode = buildDNode(
        {
            id: `${root.id}-${startNodeId}`,
            metadata: {
                name: DISPLAY_NAME_START
            }
        } as CompiledNode,
        dTypes.nestedStart
    );

    const endNode = buildDNode(
        {
            id: `${root.id}-${endNodeId}`,
            metadata: {
                name: DISPLAY_NAME_END
            }
        } as CompiledNode,
        dTypes.nestedEnd
    );

    return {
        startNode,
        endNode
    };
};

/**
 * @TODO deprecate this function (will use createDNode once id creation
 * without parent workflow is figured out)
 * @param context: graph entity to be wrapped in dNode
 */
export const buildDNode = (context: any, type: dTypes): dNode => {
    const output = {
        id: getId(context),
        value: context,
        type: type,
        name: getDisplayName(context),
        nodes: [],
        edges: []
    } as dNode;
    return output;
};

/**
 * Will parse values when dealing with a Branch and recursively find and build
 * any other node types.
 * @param root      Parent root for Branch; will render independent DAG and
 *                  add as a child node of root.
 * @param context   CompiledNode of origin
 */
export const parseBranch = (
    root: dNode,
    context: CompiledNode,
    workflow: CompiledWorkflowClosure
) => {
    const thenNodeCompiledNode = context.branchNode?.ifElse?.case
        ?.thenNode as CompiledNode;
    const thenNodeDNode = createDNode(thenNodeCompiledNode, context);
    const { startNode, endNode } = buildBranchStartEndNodes(root);

    /* We must push container node regardless */
    root.nodes.push(thenNodeDNode);

    if (thenNodeCompiledNode.branchNode) {
        buildDAG(thenNodeDNode, thenNodeCompiledNode, dTypes.branch, workflow);
    } else {
        /* Find any 'other' (other means 'else', 'else if') nodes */
        const otherArr = context.branchNode?.ifElse?.other;

        if (otherArr) {
            otherArr.map(otherItem => {
                const otherCompiledNode: CompiledNode = otherItem.thenNode as CompiledNode;
                if (otherCompiledNode.branchNode) {
                    const otherDNodeBranch = createDNode(
                        otherCompiledNode,
                        context
                    );
                    buildDAG(
                        otherDNodeBranch,
                        otherCompiledNode,
                        dTypes.branch,
                        workflow
                    );
                } else {
                    const taskType = getTaskTypeFromCompiledNode(
                        otherCompiledNode.taskNode,
                        workflow.tasks
                    );
                    const otherDNode = createDNode(
                        otherCompiledNode,
                        context,
                        taskType
                    );
                    root.nodes.push(otherDNode);
                }
            });
        }
    }

    for (let i = 0; i < root.nodes.length; i++) {
        const startEdge: dEdge = {
            sourceId: startNode.id,
            targetId: root.nodes[i].id
        };
        const endEdge: dEdge = {
            sourceId: root.nodes[i].id,
            targetId: endNode.id
        };
        root.edges.push(startEdge);
        root.edges.push(endEdge);
    }

    /* Add back to root */
    root.nodes.push(startNode);
    root.nodes.push(endNode);
};

/**
 * Handles parsing CompiledWorkflow data objects
 *
 * @param root          Root node for the graph that will be rendered
 * @param context       The current workflow (could be child of main workflow)
 * @param type          Type (sub or primrary)
 * @param workflow      Main parent workflow
 */
export const parseWorkflow = (
    root,
    context: CompiledWorkflow,
    type: dTypes,
    workflow: CompiledWorkflowClosure
) => {
    const nodesList = context.template.nodes;
    const nodeMap = {};

    /* Create mapping of id => dNode for all nodes */
    for (let i = 0; i < nodesList.length; i++) {
        const dNode: dNode = createDNode(nodesList[i], context.template);
        nodeMap[nodesList[i].id] = {
            dNode: dNode,
            compiledNode: nodesList[i]
        };
    }

    const startNode = nodeMap['start-node'].dNode;
    const contextualRoot = root == null ? startNode : root;

    const buildOutNodesFromContext = (
        root: dNode,
        context: WorkflowTemplate,
        type?: dTypes
    ): void => {
        for (let i = 0; i < context.nodes.length; i++) {
            const compiledNode: CompiledNode = context.nodes[i];
            let dNode: dNode = createDNode(compiledNode, context);
            if (isStartNode(compiledNode) && type == dTypes.subworkflow) {
                /* Case: override type as nestedStart node */
                dNode = createDNode(
                    compiledNode,
                    context,
                    null,
                    dTypes.nestedStart
                );
            } else if (isEndNode(compiledNode) && type == dTypes.subworkflow) {
                /* Case: override type as nestedEnd node */
                dNode = createDNode(
                    compiledNode,
                    context,
                    null,
                    dTypes.nestedEnd
                );
            } else if (compiledNode.branchNode) {
                buildDAG(dNode, compiledNode, dTypes.branch, workflow);
            } else if (compiledNode.workflowNode) {
                const id = compiledNode.workflowNode.subWorkflowRef;
                const subworkflow = getSubWorkflowFromId(id, workflow);
                buildDAG(dNode, subworkflow, dTypes.subworkflow, workflow);
            } else if (compiledNode.taskNode) {
                const taskType = getTaskTypeFromCompiledNode(
                    compiledNode.taskNode,
                    workflow.tasks
                );
                dNode = createDNode(compiledNode, context, taskType);
            }

            contextualRoot.nodes.push(dNode);
        }
    };

    const buildOutEdges = (root, context: ConnectionSet, ingress, nodeMap) => {
        const list = context.downstream[ingress].ids;
        for (let i = 0; i < list.length; i++) {
            const edge: dEdge = {
                sourceId: nodeMap[ingress].dNode.id,
                targetId: nodeMap[list[i]].dNode.id
            };
            root.edges.push(edge);
            if (context.downstream[list[i]]) {
                buildOutEdges(root, context, list[i], nodeMap);
            }
        }
    };

    /* Build DAG */
    buildOutNodesFromContext(contextualRoot, context.template, type);
    buildOutEdges(contextualRoot, context.connections, 'start-node', nodeMap);

    return startNode;
};

/**
 * Mutates root (if passed) by recursively rendering DAG of given context.
 *
 * @param root          Root node of DAG
 * @param graphType     DAG type (eg, branch, workflow)
 * @param context       Pointer to current context of response
 */
export const buildDAG = (
    root: dNode,
    context: any,
    graphType: dTypes,
    workflow: CompiledWorkflowClosure
) => {
    switch (graphType) {
        case dTypes.branch:
            parseBranch(root, context, workflow);
            break;
        case dTypes.subworkflow:
            parseWorkflow(root, context, graphType, workflow);
            break;
        case dTypes.primary:
            return parseWorkflow(root, context, graphType, workflow);
        default:
            console.error('@Could not map graphType');
    }
};
