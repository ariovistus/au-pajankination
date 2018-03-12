import { FrameworkConfiguration } from "aurelia-framework";
import { Config } from "aurelia-view-manager";
import { PLATFORM } from "aurelia-pal";

import "./combobox/paj-combobox";
import "./grid/paj-grid";
import "./grid/grid-sort-header";
import "./grid/grid-sort-icon";

export function configure(aurelia: FrameworkConfiguration, callback = null) {

    let config = {
        noGlobalResources: false,
    };

    if(callback != null && typeof callback == "function") {
        callback(config);
    }

    if(!config.noGlobalResources) {
        aurelia.globalResources(PLATFORM.moduleName("./combobox/paj-combobox"));
        aurelia.globalResources(PLATFORM.moduleName("./grid/paj-grid"));
        aurelia.globalResources(PLATFORM.moduleName("./grid/grid-sort-header"));
        aurelia.globalResources(PLATFORM.moduleName("./grid/grid-sort-icon"));
    }

    aurelia.container.get(Config)
        .configureNamespace('ariovistus/au-pajankination', {
            location: "./{{framework}}/{{view}}.html",
        });

}

