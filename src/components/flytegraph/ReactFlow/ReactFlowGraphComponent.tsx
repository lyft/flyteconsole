import { ConvertFlyteDagToReactFlows } from 'components/flytegraph/ReactFlow/transformerDAGToReactFlow';
import * as React from 'react';
import { RFWrapperProps, RFEntity, RFGraphTypes } from './types';
import { rfBackground } from './utils';
import { ReactFlowWrapper } from './ReactFlowWrapper';

/**
 * Renders workflow graph using React Flow.
 * @param props.data    DAG from transformerWorkflowToDAG
 * @returns ReactFlow Graph as <ReactFlowWrapper>
 */
const ReactFlowGraphComponent = props => {
    const { data } = props;
    const rfGraphJson: RFEntity[] = ConvertFlyteDagToReactFlows(data);
    console.log('ReactflowGraphComponent: rfGraphJson:', rfGraphJson);
    const backgroundStyle = rfBackground.main;
    const ReactFlowProps: RFWrapperProps = {
        backgroundStyle,
        rfGraphJson: rfGraphJson,
        type: RFGraphTypes.main
    };
    return <ReactFlowWrapper {...ReactFlowProps} />;
};

export default ReactFlowGraphComponent;
