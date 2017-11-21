import { IComboboxDataSource as IDataSource } from "./interfaces";
import { bindable, bindingMode, autoinject, customElement } from "aurelia-framework";
import * as keycode from "keycode";

@customElement("paj-combobox")
export class ComboBox {
    @bindable dataSource: IDataSource;
    @bindable({defaultValue: 20}) pageSize: number;

    items: any[];

    constructor() {
        this.items = [];
    }

    public attached() {
        this.initDropdown();
    }

    private initDropdown(): Promise<any> {
        return this.dataSource.getPage(1, 0, '').then((resultses) => {
            this.items = [];
            this.items.push.apply(this.items, resultses.rows)
        });
    }
}
