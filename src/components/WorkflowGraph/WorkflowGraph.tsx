import { Graph } from 'components/flytegraph/Graph';
import { transformerWorkflowToDAG } from './transformerWorkflowToDAG';
import { dNode } from 'models/Graph/types';
import { Workflow } from 'models/Workflow/types';
import * as React from 'react';

interface WorkflowGraphState {
    dag: dNode;
    error?: Error;
}

interface PrepareDAGResult {
    dag: dNode;
    error?: Error;
}

function workflowToDag(workflow: Workflow): PrepareDAGResult {
    try {
        if (!workflow.closure) {
            throw new Error('Workflow has no closure');
        }
        if (!workflow.closure.compiledWorkflow) {
            throw new Error('Workflow closure missing a compiled workflow');
        }
        const { compiledWorkflow } = workflow.closure;
        const dag: dNode = transformerWorkflowToDAG(compiledWorkflow);
        return { dag };
    } catch (e) {
        return {
            dag: null,
            error: e
        };
    }
}

export class WorkflowGraph extends React.Component<WorkflowGraphState> {
    constructor(props) {
        super(props);
        const { dag, error } = workflowToDag(this.props.workflow);
        this.state = { dag, error };
    }

    render() {
        const { dag } = this.state;
        return <Graph data={dag} />;
    }
}
