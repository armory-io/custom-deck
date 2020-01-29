/* IMPORTANT when you're upgrading to the next version, you'll need to do a diff of OSS current to next
 * We've essentially forked this file, so we won't get changes. Checkout the diff to make sure we don't need to change anything.
 *    cd ~/repos/oss/deck
 #    git diff upstream/release-1.14.x..upstream/release-x app/scripts/app.ts
 * Also, check our webpack.config.js for changes!
*/

import 'jquery'; // ensures jQuery is loaded before Angular so Angular does not use jqlite
import { module } from 'angular';

import { CORE_MODULE } from '@spinnaker/core';
import { DOCKER_MODULE } from '@spinnaker/docker';
import { AMAZON_MODULE } from '@spinnaker/amazon';
import { GOOGLE_MODULE } from '@spinnaker/google';
import { KUBERNETES_V1_MODULE, KUBERNETES_V2_MODULE } from '@spinnaker/kubernetes';
import { KAYENTA_MODULE } from '@spinnaker/kayenta';
import { ECS_MODULE } from '@spinnaker/ecs';
import { APPENGINE_MODULE } from '@spinnaker/appengine';

import { CUSTOM_MODULE } from './spinnaker.modules';
import { STEPEXECUTION_SHIM } from './spinnaker.modules/stepExecutionDetailsShim';

const modules = [
  CORE_MODULE,
  AMAZON_MODULE,
  GOOGLE_MODULE,
  ECS_MODULE,
  KUBERNETES_V1_MODULE,
  DOCKER_MODULE,
  KUBERNETES_V2_MODULE,
  APPENGINE_MODULE,
  KAYENTA_MODULE,
  CUSTOM_MODULE,
  STEPEXECUTION_SHIM,
];

module('netflix.spinnaker', modules);
