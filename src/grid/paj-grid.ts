import { bindable, customElement, computedFrom, autoinject } from "aurelia-framework";
import { resolvedView } from "aurelia-view-manager";
import { BindingEngine, Disposable } from "aurelia-binding";
import { IGrid, IGridRow, IGridDataSource, IGridResults } from "./interfaces";

@customElement("paj-grid")
@resolvedView("ariovistus/au-pajankination", "grid")
@autoinject
export class PaginatedGrid implements IGrid {
    @bindable({ defaultValue: 10 }) pageSize: number = 10;
    @bindable currentPage: number;
    @bindable waiting: boolean;
    @bindable failure: boolean;
    @bindable searchWaiting: boolean;
    @bindable searchFailed: boolean;
    @bindable({ defaultValue: false }) showSearch: boolean;

    @bindable({ defaultValue: [10, 20, 50] }) pageSizes: number[] = [10, 20, 50];

    @bindable() register: any;

    @bindable dataSource: IGridDataSource;

    @bindable rows: IGridRow[];
    @bindable({ defaultValue: null }) defaultOrderbyName: string;
    @bindable({ defaultValue: true }) defaultOrderbyAsc: boolean;

    private _parent: any;
    numberOfItems: number;
    startNumber: number;
    endNumber: number;
    searchText: string;
    orderbyName: string;
    orderbyAsc: boolean;

    private searchOutOfSync: boolean;
    public hide: boolean;

    private observers: Disposable[];

    constructor(private bindingEngine: BindingEngine) {
        this.searchWaiting = false;
        this.failure = false;
        this.searchFailed = false;
        this.pageSizes = [10, 20, 50];
        this.numberOfItems = 0;
        this.currentPage = 1;
        this.startNumber = 0;
        this.endNumber = 0;
        this.orderbyName = this.defaultOrderbyName;
        this.orderbyAsc = this.defaultOrderbyAsc;
        this.observers = [];
    }

    bind(bindingContext) {
        this._parent = bindingContext;
        this.orderbyName = this.defaultOrderbyName;
        this.orderbyAsc = this.defaultOrderbyAsc;
        this.firstPage();
        if (this.register != null) {
            this.register(this);
        }

        this.hookupHideObservation();
    }

    unbind() {
        for (var observer of this.observers) {
            observer.dispose();
        }
        this.observers = [];
    }

    public hookupHideObservation() {
        let hideObserver = this.bindingEngine.propertyObserver(this, 'hide')
            .subscribe((newValue, oldValue) => {
                this.onHideChange(newValue, oldValue);
            });
        this.observers.push(hideObserver);
        this.observers.push(
            this.bindingEngine.propertyObserver(this, 'defaultOrderbyName')
                .subscribe((newValue, oldValue) => {
                    if (this.orderbyName == oldValue) {
                        this.orderbyName = newValue;
                    }
                })
        );
    }

    public onHideChange(newValue: boolean, oldValue: boolean) {
        if (newValue) {
            // show to hide
        } else {
            // hide to show
            if (this.searchOutOfSync) {
                this.refreshPage();
            }
            this.searchOutOfSync = false;
        }
    }

    sortby(orderBy: string) {
        if (orderBy == null) {
            return;
        }

        if (this.orderbyName != orderBy) {
            this.orderbyName = orderBy;
            this.orderbyAsc = true;
        } else if (this.orderbyAsc) {
            this.orderbyAsc = false;
        } else if (!this.orderbyAsc && this.orderbyName != this.defaultOrderbyName) {
            this.orderbyName = this.defaultOrderbyName;
            this.orderbyAsc = this.defaultOrderbyAsc;
        } else if (!this.orderbyAsc) {
            this.orderbyAsc = true;
        }
        this.goToPage(this.currentPage);
    }

    public nextPage(): void {
        if (!this.atLast) {
            this.goToPage(this.currentPage + 1);
        }
    };

    public previousPage(): void {
        if (!this.atFirst) {
            this.goToPage(this.currentPage - 1);
        }
    };

    public firstPage(): Promise<IGridResults> {
        return this.goToPage(1);
    };

    public refreshPage(): Promise<IGridResults> {
        return this.goToPage(this.currentPage);
    }

    lastPage(): void {
        this.goToPage(this.numberOfPages);
    };

    @computedFrom('currentPage')
    get atFirst(): boolean {
        return this.currentPage <= 1;
    }

    @computedFrom('currentPage', 'pageSize', 'numberOfItems')
    get atLast(): boolean {
        return this.currentPage >= this.numberOfPages;
    }

    @computedFrom("currentPage", "pageSize", "numberOfItems")
    get enumerablePages() {
        let result = [];
        let n = 5;
        let start = Math.max(this.currentPage - n, 1);
        let stop = Math.min(this.currentPage + n, this.numberOfPages);

        let i = start;
        while (i <= stop) {
            result.push(i);
            i++;
        }

        return result;
    }

    @computedFrom("pageSize", "numberOfItems")
    get numberOfPages() {
        return Math.ceil(this.numberOfItems / this.pageSize);
    }

    pageSizeChanged(newPageSize, oldPageSize) {
        if (newPageSize != oldPageSize) {
            /**
             * we have currentPage, oldPageSize such that first item displayed in grid is
             * [(currentPage - 1) * oldPageSize + 1]th item in logical sequence, but pageSize is now newPageSize,
             * so lets try to find the page that contains the first item we are displaying now.
             * newPage must satisfy
             *  newPageSize * (newPage - 1) + 1 <= oldPageSize * (currentPage - 1) + 1 and
             *  oldPageSize * (currentPage - 1) + 1 < newPageSize * newPage + 1
             */
            let newPage = Math.floor((this.currentPage - 1) * oldPageSize / newPageSize) + 1;
            this.goToPage(newPage);
        }
    }

    goToPage(p: number): Promise<IGridResults> {
        this.waiting = true;
        return this.dataSource
            .getPage(this.pageSize, this.pageSize * (p - 1), this.searchText, { name: this.orderbyName, ascending: this.orderbyAsc })
            .then(data => {
                var possibleEnd = p * this.pageSize;
                this.waiting = false;
                this.searchWaiting = false;
                this.failure = false;
                this.searchFailed = false;
                this.numberOfItems = data.count;

                this.startNumber = this.numberOfItems === 0 ? 0 : this.pageSize * (p - 1) + 1;
                this.endNumber = possibleEnd > this.numberOfItems ? this.numberOfItems : possibleEnd;

                this.currentPage = p;
                this.rows = data.rows
                for (var row of this.rows) {
                    row['parent'] = this._parent;
                }
                return data;
            }, (failed) => {
                this.searchWaiting = false;
                this.waiting = false;
                this.failure = true;
                this.searchFailed = true;
                return null;
            });
    };

    onSearchKeyup(evnt: Event) {
        this.searchWaiting = true;
        this.firstPage();
    }

    probablyGoToPage(i) {
        if (i != this.currentPage) {
            this.goToPage(i);
        }
    }
    clearSearch() {
        this.searchText = "";
        this.searchWaiting = true;
        this.firstPage();
    }

    public refreshUnlessHidden() {
        if (!this.hide) {
            this.refreshPage();
        } else {
            this.searchOutOfSync = true;
        }
    }
}
