import {Aurelia} from 'aurelia-framework'
import { Config } from "aurelia-view-manager";
import environment from './environment';
import { PLATFORM } from "aurelia-pal"

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .plugin(PLATFORM.moduleName("au-pajankination"))
    .plugin(PLATFORM.moduleName("aurelia-view-manager"))
    .feature('resources');

  aurelia.container.get(Config)
    .configureNamespace("ariovistus/au-pajankination", {
      map: {
        "combobox": "combobox.html",
      }
    });

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.start().then(() => aurelia.setRoot());
}
