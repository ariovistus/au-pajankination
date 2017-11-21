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
            this.rebuildItems();
            this.physicalSelectedIndex = 0 + 
                (itemIndex - this.currentPageIndex * this.pageSize); // previousPage.length + offset in current page
        });

        return promise;
    }

    private rebuildItems() {
        this.items = [];
        this.items.push.apply(this.items, this.currentPage)
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


    private scrollItemToView(index, forceByTop=false) {
        let elementScrollTop = 0;
        if(this.noResults) {
            elementScrollTop = this.noResultsElement.scrollHeight;
        }
        for(var i = 0; i < index; i++) {
            elementScrollTop += this.items[i]._element.scrollHeight;
        }
        var element: any = this.items[index]._element;
        let viewPaneHeight = element.parentNode.parentNode.scrollHeight;
        let elementScrollBottom = elementScrollTop + element.scrollHeight;

        if(!forceByTop && element.parentNode.scrollTop < elementScrollBottom - viewPaneHeight) {
            element.parentNode.scrollTop = elementScrollBottom - viewPaneHeight;
        }else if(forceByTop || element.parentNode.scrollTop > elementScrollTop) {
            element.parentNode.scrollTop = elementScrollTop;
        }
    }

    public detached() {
    }

    public dunscrolled(scrollEvent) {
        let visibleIndex = this.physicalIndexFromScrollTop(this.dropdownScrollTop);
        if(visibleIndex <= 0.75 * this.lastPreviousIndex()) {
            //this.shiftPageDown();
        }else if(visibleIndex >= this.firstNextIndex()) {
            //this.shiftPageUp();
        }
    }

    private lastPreviousIndex() {
        return this.previousPage.length-1;
    }

    private firstNextIndex() {
        return this.previousPage.length + this.currentPage.length;
    }

    private selectedItemOutsideWindow() {
        this.physicalSelectedIndex = -1;
    }

    shiftingDownPromise: Promise<any>;

    private cancelShiftPageDown() {
        if(this.shiftingDownPromise == null) {
            return;
        }
        this.shiftingDownPromise['canceled'] = true;
        this.shiftingDownPromise = null;
    }

    shiftingUpPromise: Promise<any>;

    // either aurelia has no way to wait for dom elements to be populated, or I haven't found it yet

    private cancelShiftPageUp() {
        if(this.shiftingUpPromise == null) {
            return;
        }
        this.shiftingUpPromise['canceled'] = true;
        this.shiftingUpPromise = null;
    }

    /**
     * given scrollTop of window, determine the index into items of the item displayed at scrollTop
     * returns index in [0 to items.length]
     */
    private physicalIndexFromScrollTop(scrollTop) {
        let elementScrollTop = 0;
        let physicalIndex = 0;
        for(; physicalIndex < this.items.length; physicalIndex++) {
            elementScrollTop += this.items[physicalIndex]._element.scrollHeight;
            if(scrollTop < elementScrollTop) {
                break;
            }
        }
        return physicalIndex;
    }

    public onClick(clickEvent) {
        if(clickEvent.target.classList.contains("select2-selection__clear")) {
            this.clearSelection();
            this.closeDropdown();
        }else{
            this.toggleDropdown();
        }
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

    private anyHeightlessElements(limitIndex) {
        for(var i = 0; i < limitIndex; i++) {
            if(this.items[i]._element.scrollHeight == 0) {
                return true;
            }
        }
        return false;
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
