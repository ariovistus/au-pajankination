import {autoinject, customElement, bindable } from "aurelia-framework";
import { resolvedView } from "aurelia-view-manager";
import { PaginatedGrid } from "./paj-grid";

@customElement("sort-icon")
@resolvedView("ariovistus/au-pajankination", "grid-sort-icon")
export class GridSortIcon {
    @bindable() public grid: PaginatedGrid;
    @bindable() public column: string;
}
