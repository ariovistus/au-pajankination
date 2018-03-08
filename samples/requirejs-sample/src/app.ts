import { autoinject } from "aurelia-framework";
import { SpoofedDataSource, SpoofedDataSource2 } from "./data-source";

@autoinject
export class App {
    mahclasses = "honk claptrap";
    dataSource: SpoofedDataSource;
    gridDataSource: SpoofedDataSource2;
    dataState: any;

    constructor() {
        this.dataSource = new SpoofedDataSource();
        this.gridDataSource = new SpoofedDataSource2();
        this.dataState = {};
    }

    checky(evnt, item) {
        if (item.checked) {
            item.classes = "tacos"
        }else{ 
            item.classes = "";
        }
        return true;
    }
}
