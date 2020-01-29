import { module } from 'angular';
import { OverrideRegistry } from '@spinnaker/core';
import { CUSTOM_STEP_EXECUTION_DETAILS } from './custom.stepexecutiondetails.module';

export const STEPEXECUTION_SHIM = 'spinnaker.stepexecutiondetails.shim';
const ngmodule = module(STEPEXECUTION_SHIM, [CUSTOM_STEP_EXECUTION_DETAILS]);
const template = require('./stepexecutiondetails.shim.template.html');

ngmodule.run(function(overrideRegistry: OverrideRegistry)  {
  'ngInject';
  overrideRegistry.overrideTemplate('stepExecutionDetails', template);
});
