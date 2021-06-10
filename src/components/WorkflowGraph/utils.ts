import { Identifier } from 'models/Common/types';
import { endNodeId, startNodeId } from 'models/Node/constants';
import { WorkflowTemplate } from 'models/Workflow/types';
import { CompiledNode, TaskNode } from 'models/Node/types';
import { CompiledTask, TaskTemplate } from 'models/Task/types';
import { dTypes } from 'models/Graph/types';

/**
 * @TODO these are dupes for testing, remove once tests fixed
 */
export const DISPLAY_NAME_START = 'start';
export const DISPLAY_NAME_END = 'end';

export function isStartNode(node: any) {
    return node.id === startNodeId;
}

export function isEndNode(node: any) {
    return node.id === endNodeId;
}

/**
 * Utility funciton assumes (loose) parity between [a]->[b] if matching
 * keys have matching values.
 * @param a     object
 * @param b     object
 * @returns     boolean
 */
export const checkIfObjectsAreSame = (a, b) => {
    for (const k in a) {
        if (a[k] != b[k]) {
            return false;
        }
    }
    return true;
};

export const createId = (template: WorkflowTemplate, name: string): string => {
    const output = `${template.id.name}_${template.id.version}_${name}`;
    return output;
};

/**
 * Returns a display name from either workflows or nodes
 * @param context input can be either CompiledWorkflow or CompiledNode
 * @returns Display name
 */
export const getDisplayName = (context: any): string => {
    let fullName;
    if (context.metadata) {
        // Compiled Node with Meta
        fullName = context.metadata.name;
    } else if (context.id) {
        // Compiled Node (start/end)
        fullName = context.id;
    } else {
        // CompiledWorkflow
        fullName = context.template.id.name;
    }
    if (fullName == startNodeId) {
        return DISPLAY_NAME_START;
    } else if (fullName == endNodeId) {
        return DISPLAY_NAME_END;
    } else if (fullName.indexOf('.') > 0) {
        return fullName.substr(
            fullName.lastIndexOf('.') + 1,
            fullName.length - 1
        );
    } else {
        return fullName;
    }
};

/**
 * Will return the id for either CompiledWorkflow or CompiledNode
 * @param context   will find id for this entity
 * @returns id
 */
export const getId = (context: any): string => {
    if (context.template) {
        return context.template.id.name;
    } else {
        return context.id;
    }
};

export const getNodeTypeFromCompiledNode = (node: CompiledNode): dTypes => {
    if (isStartNode(node)) {
        return dTypes.start;
    } else if (isEndNode(node)) {
        return dTypes.end;
    } else if (node.branchNode) {
        return dTypes.branch;
    } else if (node.workflowNode) {
        return dTypes.subworkflow;
    } else {
        return dTypes.task;
    }
};

export const getSubWorkflowFromId = (id, workflow) => {
    const { subWorkflows } = workflow;
    /* Find current matching entitity from subWorkflows */
    for (const k in subWorkflows) {
        const subWorkflowId = subWorkflows[k].template.id;
        if (checkIfObjectsAreSame(subWorkflowId, id)) {
            return subWorkflows[k];
        }
    }
    return false;
};

export const getTaskTypeFromCompiledNode = (
    taskNode: TaskNode,
    tasks: CompiledTask[]
) => {
    for (let i = 0; i < tasks.length; i++) {
        const compiledNode: CompiledTask = tasks[i];
        const taskTemplate: TaskTemplate = compiledNode.template;
        const templateId: Identifier = taskTemplate.id;
        if (checkIfObjectsAreSame(templateId, taskNode.referenceId)) {
            return compiledNode;
        }
    }
    return false;
};
