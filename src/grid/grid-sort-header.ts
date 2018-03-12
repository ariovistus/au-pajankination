import {autoinject, customElement, bindable } from "aurelia-framework";
import { resolvedView } from "aurelia-view-manager";
import { PaginatedGrid } from "./paj-grid";
import "./grid-sort-icon";

@customElement("sort-header")
@resolvedView("ariovistus/au-pajankination", "grid-sort-header")
export class GridSortHeader {
    @bindable() public grid: PaginatedGrid;
    @bindable() public column: string;
}
