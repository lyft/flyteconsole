import { DialogContent } from '@material-ui/core';
import * as React from 'react';
import { formStrings } from './constants';
import { LaunchFormActions } from './LaunchFormActions';
import { LaunchFormHeader } from './LaunchFormHeader';
import { LaunchFormInputs } from './LaunchFormInputs';
import { LaunchState } from './launchMachine';
import { SearchableSelector } from './SearchableSelector';
import { useStyles } from './styles';
import {
    BaseInterpretedLaunchState,
    BaseLaunchService,
    LaunchWorkflowFormProps
} from './types';
import { useLaunchWorkflowFormState } from './useLaunchWorkflowFormState';

/** Renders the form for initiating a Launch request based on a Workflow */
export const LaunchWorkflowForm: React.FC<LaunchWorkflowFormProps> = props => {
    const {
        formInputsRef,
        state,
        service,
        workflowSourceSelectorState
    } = useLaunchWorkflowFormState(props);
    const styles = useStyles();
    const baseState = state as BaseInterpretedLaunchState;
    const baseService = service as BaseLaunchService;

    const {
        fetchSearchResults,
        launchPlanSelectorOptions,
        onSelectLaunchPlan,
        onSelectWorkflowVersion,
        selectedLaunchPlan,
        selectedWorkflow,
        workflowSelectorOptions
    } = workflowSourceSelectorState;

    const showWorkflowSelector = ![
        LaunchState.LOADING_WORKFLOW_VERSIONS,
        LaunchState.FAILED_LOADING_WORKFLOW_VERSIONS
    ].some(state.matches);
    const showLaunchPlanSelector =
        state.context.workflowVersion &&
        ![
            LaunchState.LOADING_LAUNCH_PLANS,
            LaunchState.FAILED_LOADING_LAUNCH_PLANS
        ].some(state.matches);

    // TODO: We removed all loading indicators here. Decide if we want skeletons
    // instead.
    return (
        <>
            <LaunchFormHeader title={state.context.sourceId?.name} />
            <DialogContent dividers={true} className={styles.inputsSection}>
                {showWorkflowSelector ? (
                    <section
                        title={formStrings.workflowVersion}
                        className={styles.formControl}
                    >
                        <SearchableSelector
                            id="launch-workflow-selector"
                            label={formStrings.workflowVersion}
                            onSelectionChanged={onSelectWorkflowVersion}
                            options={workflowSelectorOptions}
                            fetchSearchResults={fetchSearchResults}
                            selectedItem={selectedWorkflow}
                        />
                    </section>
                ) : null}
                {showLaunchPlanSelector ? (
                    <section
                        title={formStrings.launchPlan}
                        className={styles.formControl}
                    >
                        <SearchableSelector
                            id="launch-lp-selector"
                            label={formStrings.launchPlan}
                            onSelectionChanged={onSelectLaunchPlan}
                            options={launchPlanSelectorOptions}
                            selectedItem={selectedLaunchPlan}
                        />
                    </section>
                ) : null}
                <LaunchFormInputs ref={formInputsRef} state={baseState} />
            </DialogContent>
            <LaunchFormActions
                state={baseState}
                service={baseService}
                onClose={props.onClose}
            />
        </>
    );
};
