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
    keyListener: any;
    clickListener: any;

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
        this.keyListener = (keyEvent) => {
            this.onKeyDown(keyEvent);
        };
        this.clickListener = (clickEvent) => {
            if(!this.element.contains(clickEvent.target)) {
                this.closeDropdown();
            }
        };

        this.initDropdown();

        document.addEventListener("keydown", this.keyListener);
        document.addEventListener("click", this.clickListener);
    }

    private setPageIndecesAtStart() {
        this.previousPageIndex = -1; // previousPageState = null
        this.currentPageIndex = 0;  // currentPageState = firstPageState()
        this.nextPageIndex = 1; // nextPageState = increment(currentPageState)
    }

    private initDropdown(): Promise<any> {
        let promise : Promise<any> = Promise.resolve("yup");
        let itemIndex = 0;

        if(this.selectedId != null) {
            promise = this.dataSource.getIndex(this.selectedId).then(index => {
                this.selectedItemPageIndex = Math.floor(index / this.pageSize);
                this.currentPageIndex = this.selectedItemPageIndex; // currentPageState = getPageOf(id)
                this.previousPageIndex = this.currentPageIndex - 1;
                this.nextPageIndex = this.currentPageIndex + 1;
                itemIndex = index;
                this.needsScrollToSelectedItem = true;
            }, errorResponse => {
                // can't find item, can't locate window containing item, so clear item and act like it wasn't set
                this.deselect();
                this.setPageIndecesAtStart();
            });
        }else{
            this.setPageIndecesAtStart();
        }
        promise = promise.then(() => Promise.all([
            this.getPreviousPage(this.previousPageIndex), // getPage(previousPageState)
            this.getCurrentPage(this.currentPageIndex), // getPage(currentPageState)
            this.getNextPage(this.nextPageIndex),       // getPage(nextPageState) 
        ])).then((resultses: IComboboxResults[]) => {
            this.previousPage = resultses[0].rows;
            this.currentPage = resultses[1].rows;
            this.nextPage = resultses[2].rows;
            this.rebuildItems();
            this.physicalSelectedIndex = this.previousPage.length + 
                (itemIndex - this.currentPageIndex * this.pageSize); // previousPage.length + offset in current page
        });

        if(this.selectedId != null) {
            promise.then(() => {
                for(var item of this.currentPage) {
                    if(this.dataSource.getId(item) == this.selectedId) {
                        this.selectedObject = item;
                    }
                }
                // prevent shifts until current item has been scrolled into view
                this.shiftingDownPromise = Promise.resolve("yup");
                this.shiftingUpPromise = Promise.resolve("yup");
            });
        }
        return promise;
    }

    private rebuildItems() {
        this.items = [];
        this.items.push.apply(this.items, this.previousPage)
        this.items.push.apply(this.items, this.currentPage)
        this.items.push.apply(this.items, this.nextPage)
    }

    private shiftItemsUp(popFrontCount) {
        for(var i = 0; i < popFrontCount; i++) {
            this.items.shift();
        }
        this.items.push.apply(this.items, this.nextPage)
    }

    private shiftItemsDown(popBackCount) {
        for(var i = 0; i < popBackCount; i++) {
            this.items.pop();
        }
        for(var i = 0; i < this.previousPage.length; i++) {
            this.items.unshift(this.previousPage[this.previousPage.length-i-1]);
        }
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

    private getPreviousPage(index): Promise<IComboboxResults> {
        if(index < 0) { // if pageState == null
            return Promise.resolve({rows: [], count: 0});
        }
        return this.getPage(this.pageSize, this.pageSize * index, this.searchText);
    }

    private getNextPage(index): Promise<IComboboxResults> {
        return this.getPage(this.pageSize, this.pageSize * index, this.searchText);
    }

    private onKeyDown(keyEvent) {
        if(this.opened) {
            if(keyEvent.keyCode == keycode("down")) {
                this.highlight(this.highlightedIndex+1);
                setTimeout(() => this.scrollHighlightedToView(), 0);
            }else if(keyEvent.keyCode == keycode("up")) {
                this.highlight(this.highlightedIndex-1);
                setTimeout(() => this.scrollHighlightedToView(), 0);
            }else if(keyEvent.keyCode == keycode("enter")) {
                this.select(this.highlightedIndex);
                this.closeDropdown();
            }else if(keyEvent.keyCode == keycode("escape") || 
                    keyEvent.keyCode == keycode('tab')) {
                this.closeDropdown();
            }
        }
    }

    private scrollHighlightedToView() {
        if(this.highlightedIndex || this.highlightedIndex === 0) {
            this.scrollItemToView(this.highlightedIndex);
        }
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
        document.removeEventListener("keydown", this.keyListener);
        document.removeEventListener("click", this.clickListener);
    }

    public dunscrolled(scrollEvent) {
        let visibleIndex = this.physicalIndexFromScrollTop(this.dropdownScrollTop);
        if(visibleIndex <= 0.75 * this.lastPreviousIndex()) {
            this.shiftPageDown();
        }else if(visibleIndex >= this.firstNextIndex()) {
            this.shiftPageUp();
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
    private shiftPageDown() {
        if(this.shiftingDownPromise != null) {
            return;
        }
        if(this.currentPageIndex == 0) {
            return;
        }
        let oldVisibleIndex = this.physicalIndexFromScrollTop(this.dropdownScrollTop);
        let promise = this.getPreviousPage(this.previousPageIndex-1).then(results => { // getPage(decrement(previousPageState))
            if(!promise['canceled']) {
                if(this.physicalSelectedIndex != null && this.physicalSelectedIndex >= this.firstNextIndex()) {
                    this.selectedItemOutsideWindow();
                }else if(this.physicalSelectedIndex != -1) {
                    this.physicalSelectedIndex += results.rows.length;
                }
                oldVisibleIndex += results.rows.length;
                var popBackCount = this.nextPage.length;
                this.nextPage = this.currentPage;
                this.currentPage = this.previousPage;
                this.previousPage = results.rows;
                this.previousPageIndex--;
                this.currentPageIndex--; // decrement(currentPageState)
                this.nextPageIndex--;
                this.shiftItemsDown(popBackCount);
                return this.waitWhile({
                    predicate: () => this.previousPage.length > 0 && this.previousPage[0]._element == null,
                    onComplete: () => {
                        let newVisibleIndex = this.physicalIndexFromScrollTop(this.dropdownScrollTop);
                        if(oldVisibleIndex != newVisibleIndex) {
                            this.scrollItemToView(oldVisibleIndex, true);
                        }
                    },
                    onError: () => this.shiftingDownPromise = null,
                }).then(x => {
                    return this.waitWhile({
                        predicate: () => {
                            let newVisibleIndex = this.physicalIndexFromScrollTop(this.dropdownScrollTop);
                            return oldVisibleIndex != newVisibleIndex;
                        },
                        onComplete: () => {
                            this.shiftingDownPromise = null;
                        },
                        onError: () => this.shiftingDownPromise = null,
                    });
                });
            }
        });
        this.shiftingDownPromise = promise
        this.shiftingDownPromise['canceled'] = false;
    }

    private cancelShiftPageDown() {
        if(this.shiftingDownPromise == null) {
            return;
        }
        this.shiftingDownPromise['canceled'] = true;
        this.shiftingDownPromise = null;
    }

    shiftingUpPromise: Promise<any>;
    private shiftPageUp() {
        if(this.shiftingUpPromise != null) {
            return;
        }
        if(this.maxPageIndexKnown && this.nextPageIndex >= this.maxPageIndex+1) { // maxPageKnown && exceedsMaxPage(nextPageState)
            return;
        }
        let promise = this.getNextPage(this.nextPageIndex+1).then(results => { // getPage(increment(nextPageState))
            if(!promise['canceled'] && results.rows.length != 0) {
                let lastPreviousIndex = this.previousPage.length-1;
                if(this.physicalSelectedIndex != null && this.physicalSelectedIndex <= this.lastPreviousIndex()) {
                    this.selectedItemOutsideWindow();
                }else{
                    this.physicalSelectedIndex -= this.previousPage.length;
                }
                var popFrontCount = this.previousPage.length;
                this.previousPage = this.currentPage;
                this.currentPage = this.nextPage;
                this.nextPage = results.rows;
                this.previousPageIndex++;
                this.currentPageIndex++; // increment(currentPageState)
                this.nextPageIndex++;
                this.shiftItemsUp(popFrontCount);

                return this.waitWhile({
                    predicate: () => this.nextPage.length > 0 && this.nextPage[this.nextPage.length-1]._element == null,
                    onComplete: () => {
                        this.shiftingUpPromise = null
                    },
                    onError: () => this.shiftingUpPromise = null,
                });

            }
        });
        this.shiftingUpPromise = promise
        this.shiftingUpPromise['canceled'] = false;
        this.cancelShiftPageDown();
    }

    // either aurelia has no way to wait for dom elements to be populated, or I haven't found it yet
    private waitWhile(opts): Promise<any> {
        return new Promise((resolve, reject) => {
            let intervalId;
            let action = () => {
                try {
                    if (opts.predicate()) {
                        if('onWait' in opts && opts.onWait != null) {
                            opts.onWait();
                        }
                        return;
                    }
                    opts.onComplete();
                    clearInterval(intervalId);
                    resolve();
                }catch(e) {
                    if('onError' in opts && opts.onError != null) {
                        opts.onError();
                    }
                    clearInterval(intervalId);
                    reject(e);
                }
            };
            intervalId = setInterval(action, 1);
        });
    }

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
        return true;
    }

    onClickItem(index, clickEvent) {
        this.select(index);
        if(index < this.items.length && index >= 0) {
            this.scrollItemToView(index);
        }

        if(this.selectCloses) {
            this.closeDropdown();
        }
        return true;
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
        setTimeout(() => {
            this.searchTextElement['focus']();
        }, 1);
        this.setDropdownPosition();
        this.maybeScrollToSelectedItem();
        this.highlight(this.physicalSelectedIndex || 0);
    }

    private maybeScrollToSelectedItem() {
        if(this.needsScrollToSelectedItem) {
            this.cancelSearch();
            let index = Math.max(0, this.physicalSelectedIndex);
            this.dropdownScrollTop = 0;
            this.waitWhile({
                predicate: () => this.physicalSelectedIndex > 0 && this.dropdownScrollTop == 0,
                onWait: () => {
                    this.scrollItemToView(index, true);
                },
                onComplete: () => {
                    this.needsScrollToSelectedItem = false;
                    // allow shifting now
                    this.cancelShiftPageDown();
                    this.cancelShiftPageUp();
                }
            });
        }
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
        if(index < 0) index = 0;
        if(index >= this.items.length) index = this.items.length-1;
        this.highlighted = this.items[index];
        this.highlightedIndex = index;
    }

    onSearchKeydown(keyEvent) {
        if(this.searchText != null && this.searchText != "") {
            this.search();
        }else if(this.inSearchMode) {
            this.cancelSearch();
            this.initDropdown().then(() => {
                return this.waitWhile({
                    predicate: () => this.items.length > 0 && this.items[this.items.length-1]._element == null,
                    onComplete: () => {
                    }
                });
            }).then(() => {
                this.maybeScrollToSelectedItem();
            });
        }
    }

    searchPromise: Promise<any>;
    private search() {
        this.inSearchMode = true;
        this.searching = true;
        if(this.searchPromise != null && this.searchPromise['searchText'] == this.searchText) {
            return;
        }
        if(this.searchPromise != null && this.searchPromise['searchText'] != this.searchText) {
            this.cancelSearch();
        }
        this.maxPageIndexKnown = false;
        // prevent shifting from messing with this
        this.shiftingDownPromise = Promise.resolve("yup");
        this.shiftingUpPromise = Promise.resolve("yup");
        let promise = Promise.all([
            this.getCurrentPage(0), // getCurrentPage(currentPageState)
            this.getNextPage(1) // getNextPage(currentPageState) <- semantics change for getNextPage
        ]).then(resultses => {
            if(promise['canceled']) {
                return
            }
            this.searching = false;
            this.previousPage = [];
            this.currentPage = resultses[0].rows;
            this.nextPage = resultses[1].rows;
            this.setPageIndecesAtStart();
            this.rebuildItems();
            this.noResults = resultses[0].rows.length == 0;
            this.physicalSelectedIndex = -1;
            return this.waitWhile({
                predicate: () => !promise['canceled'] && this.items.length > 0 && this.items[this.items.length-1]._element == null,
                onComplete: () => {
                    if(promise['canceled']) {
                        return;
                    }
                    if(this.items.length > 0) {
                        this.scrollItemToView(0);
                    }
                    this.searchPromise = null;
                    // shifting can happen now
                    this.cancelShiftPageDown();
                    this.cancelShiftPageUp();
                },
                onError: () => {
                    this.searchPromise = null;
                }
            });
        }, errorResponse => {
            this.searching = false;
            this.noResults = true;
        });
        promise['searchText'] = this.searchText;
        promise['canceled'] = false;
        this.searchPromise = promise;
    }

    private cancelSearch() {
        if(this.searchPromise != null) {
            this.searchPromise['canceled'] = true;
            this.searchPromise = null;
        }
    }

    private matches(item) {
        for(var key of Object.keys(item)) {
            if(typeof item[key] == "string") {
                if(item[key].toLowerCase().indexOf(this.searchText) != -1) {
                    return true;
                }
            }
        }
        return false;
    }

    public deselect() {
        this.selectedId = null;
        this.selectedObject = null;
        this.physicalSelectedIndex = null;
    }

    public selectedIdChanged(newValue, oldValue) {
        if(newValue != null) {
            this.initDropdown().then(() => {
                if(this.opened) {
                    this.maybeScrollToSelectedItem();
                }
            })
        }else{
            this.deselect();
        }
    }
}
