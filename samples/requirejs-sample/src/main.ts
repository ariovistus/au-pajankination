import {Aurelia} from 'aurelia-framework'
import environment from './environment';
import { PLATFORM } from "aurelia-pal"
import "au-pajankination/grid/paj-grid";
import "au-pajankination/grid/grid-sort-header";
import "au-pajankination/grid/grid-sort-icon";

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature('resources');

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.start().then(() => aurelia.setRoot());
}
