import { module, IController } from 'angular';


class StepExecutionDetailsController implements IController {
  public $location: any;
  public constructor($location: ng.ILocationService) {
    'ngInject';
    this.$location = $location;
  }
}

export const STEPEXECUTIONDETAILS_SHIM_CONTROLLER = 'spinnaker.stepexecutiondetails.shim.controller';
module(STEPEXECUTIONDETAILS_SHIM_CONTROLLER, [])
  .controller('stepExecutionDetailsController', StepExecutionDetailsController);
