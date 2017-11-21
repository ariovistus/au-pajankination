import { IComboboxDataSource as IDataSource, IComboboxResults, IComboboxRow } from "./interfaces";
import { bindable, bindingMode, autoinject, customElement } from "aurelia-framework";
import * as keycode from "keycode";

@customElement("paj-combobox")
@autoinject
export class ComboBox {
    @bindable dataSource: IDataSource;
    @bindable({defaultBindingMode: bindingMode.twoWay}) selectedId: any;
    @bindable({defaultBindingMode: bindingMode.oneWay}) selectedObject: IComboboxRow;
    @bindable({defaultValue: "300px"}) width: string;
    @bindable({defaultValue: "none"}) maxWidth: string;
    @bindable({defaultValue: 20}) pageSize: number; // pagingParams

    @bindable({defaultValue: true}) selectCloses: boolean;

    previousPageIndex: number; // previousPageState
    currentPageIndex: number; // currentPageState
    nextPageIndex: number; // nextPageState
    items: IComboboxRow[];
    previousPage: IComboboxRow[];
    currentPage: IComboboxRow[];
    nextPage: IComboboxRow[];
    maxPageIndex: number;
    maxPageIndexKnown: boolean;

    searching: boolean;
    noResults: boolean;
    opened: boolean;
    highlightedIndex: number; // physical index (into items)
    highlighted: any;
    inSearchMode: boolean;
    /**
     * index into items; 
     * if currently selected object is not in items, -1
     * if no object is selected, null
     */
    physicalSelectedIndex: number;
    selectedItemPageIndex: number;

    searchText: string;
    dropdownScrollTop: any;

    searchElement: Element;
    searchTextElement: Element;
    noResultsElement: Element;
    dropdownElement: Element;
    displayElement: Element;
    needsScrollToSelectedItem: boolean;

    constructor(private element: Element) {
        this.opened = false;
        this.items = [];
        this.selectedId = null;
        this.selectedObject = null;
        this.physicalSelectedIndex = null;
        this.highlightedIndex = null;
        this.maxPageIndexKnown = false;
        this.dropdownScrollTop = 0;
        this.needsScrollToSelectedItem = false;
    }

    public attached() {

        this.initDropdown();
    }

    private setPageIndecesAtStart() {
        this.previousPageIndex = -1; // previousPageState = null
        this.currentPageIndex = 0;  // currentPageState = firstPageState()
        this.nextPageIndex = 1; // nextPageState = increment(currentPageState)
    }

    private initDropdown(): Promise<any> {
        let promise : Promise<any> = this.getCurrentPage(this.currentPageIndex);
        let itemIndex = 0;

        this.setPageIndecesAtStart();
        promise = promise.then((resultses) => {
            this.currentPage = resultses.rows;
            this.items = [];
            this.items.push.apply(this.items, this.currentPage)
            this.physicalSelectedIndex = 0 + 
                (itemIndex - this.currentPageIndex * this.pageSize); // previousPage.length + offset in current page
        });

        return promise;
    }


    private getPage(take, skip, searchText): Promise<IComboboxResults> {
        return this.dataSource.getPage(take, skip, searchText).then(results => {
            this.maxPageIndex = Math.floor(results.count / this.pageSize);
            this.maxPageIndexKnown = true;
            return results;
        });
    }

    private getCurrentPage(index): Promise<IComboboxResults> {
        return this.getPage(this.pageSize, this.pageSize * index, this.searchText);
    }

    public detached() {
    }

    public onClick(clickEvent) {
        this.toggleDropdown();
    }

    onClickItem(index, clickEvent) {
    }

    toggleDropdown() {
        if(this.opened) {
            this.closeDropdown();
        }else{
            this.openDropdown();
        }
    }

    openDropdown() {
        this.opened = true;
        this.setDropdownPosition();
    }

    private setDropdownPosition() {
        this.dropdownElement['style']['left'] = this.displayElement['offsetLeft'] + "px";
        this.dropdownElement['style']['top'] = (this.displayElement['offsetTop'] + this.displayElement['offsetHeight']) + "px";

        let width = this.width || "";
        if(width.indexOf("%") != -1) {
            width = this.displayElement['offsetWidth'] + "px";
        }
        this.dropdownElement['style']['width'] = width;
    }

    closeDropdown() {
        this.opened = false;
        this.searching = false;
        if(this.inSearchMode) {
            this.initDropdown();
            this.searchText = "";
        }
        this.inSearchMode = false;
    }

    select(index) {
        if(index < 0) index = 0;
        if(index >= this.items.length) index = this.items.length-1;
        this.selectedObject = this.items[index];
        this.selectedId = this.dataSource.getId(this.items[index]); // getId(item)
        this.physicalSelectedIndex = index;
    }

    clearSelection() {
        this.physicalSelectedIndex = null;
        this.selectedId = null;
        this.selectedObject = null;
    }

    highlight(index) {
    }

    onSearchKeydown(keyEvent) {
    }

}
