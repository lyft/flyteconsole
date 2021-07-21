import * as React from 'react';
import ReactFlowGraphComponent from './ReactFlow/ReactFlowGraphComponent';
import { dNode } from 'models/Graph/types';

export class Graph<T> extends React.Component<dNode> {
    public render() {
        const { data } = this.props;
        return <ReactFlowGraphComponent data={data} />;
    }
}
