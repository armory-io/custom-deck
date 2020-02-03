import { module } from 'angular';
import { OverrideRegistry } from '@spinnaker/core';
import { ManifestStatus } from 'layout/ManifestStatus';

export const MANIFESTSTATUS_SHIM = 'spinnaker.manifestatus.shim';
const ngmodule = module(MANIFESTSTATUS_SHIM, []);

ngmodule.run(function(overrideRegistry: OverrideRegistry)  {
  'ngInject';
  overrideRegistry.overrideComponent('kubernetes.v2.pipeline.stages.deployManifest.manifestStatus', ManifestStatus);
});
