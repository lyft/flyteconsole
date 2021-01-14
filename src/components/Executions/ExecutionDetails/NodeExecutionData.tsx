import Typography from '@material-ui/core/Typography';
import { useCommonStyles } from 'components/common/styles';
import { WaitForData } from 'components/common/WaitForData';
import { useNodeExecutionData } from 'components/hooks/useNodeExecution';
import { RemoteLiteralMapViewer } from 'components/Literals/RemoteLiteralMapViewer';
import { NodeExecution } from 'models/Execution/types';
import * as React from 'react';

/** Fetches and renders the execution data (inputs/outputs for a given
 * `NodeExecution`) */
export const NodeExecutionData: React.FC<{ execution: NodeExecution }> = ({
    execution
}) => {
    const commonStyles = useCommonStyles();
    const executionData = useNodeExecutionData(execution.id);
    return (
        <WaitForData {...executionData}>
            {() => (
                <>
                    <div className={commonStyles.detailsPanelCard}>
                        <div className={commonStyles.detailsPanelCardContent}>
                            <header>
                                <Typography variant="subtitle2">
                                    Inputs
                                </Typography>
                            </header>
                            <section>
                                <RemoteLiteralMapViewer
                                    map={executionData.value.fullInputs}
                                    blob={executionData.value.inputs}
                                />
                            </section>
                        </div>
                    </div>
                    <div className={commonStyles.detailsPanelCard}>
                        <div className={commonStyles.detailsPanelCardContent}>
                            <header>
                                <Typography variant="subtitle2">
                                    Outputs
                                </Typography>
                            </header>
                            <section>
                                <RemoteLiteralMapViewer
                                    map={executionData.value.fullOutputs}
                                    blob={executionData.value.outputs}
                                />
                            </section>
                        </div>
                    </div>
                </>
            )}
        </WaitForData>
    );
};
