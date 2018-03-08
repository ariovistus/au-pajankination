import {autoinject, customElement, bindable } from "aurelia-framework";
import { PaginatedGrid } from "./paj-grid";

@customElement("sort-icon")
export class GridSortIcon {
    @bindable() public grid: PaginatedGrid;
    @bindable() public column: string;
}
