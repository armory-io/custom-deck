import { module } from 'angular';
import { STEPEXECUTIONDETAILS_SHIM_CONTROLLER } from './stepExecutionDetailsShim';

export const CUSTOM_MODULE = 'custom.platform';
module(CUSTOM_MODULE, [STEPEXECUTIONDETAILS_SHIM_CONTROLLER,]);
