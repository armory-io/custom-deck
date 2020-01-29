import { module } from 'angular';
import { react2angular } from 'react2angular';
import { StepExecutionDetails } from 'layout/stepExecutionDetails';

export const CUSTOM_STEP_EXECUTION_DETAILS = 'custom.step.execution';
const ngmodule = module(CUSTOM_STEP_EXECUTION_DETAILS, []);
ngmodule.component('customStepExecutionDetails', react2angular(StepExecutionDetails));
