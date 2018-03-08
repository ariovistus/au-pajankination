import {autoinject, customElement, bindable } from "aurelia-framework";
import { PaginatedGrid } from "./paj-grid";

@customElement("sort-header")
export class GridSortHeader {
    @bindable() public grid: PaginatedGrid;
    @bindable() public column: string;
}
