import {autoinject} from "aurelia-framework";
import {SpoofedDataSource} from "./data-source";

@autoinject
export class App {
    message = 'Hello World!';
    mahclasses = "honk claptrap";
    dataSource: SpoofedDataSource;
    dataState: any;

    constructor() {
        this.dataSource = new SpoofedDataSource();
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
