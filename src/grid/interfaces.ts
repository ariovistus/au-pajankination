export interface IGridColumn {
    title: string;
    name?: string;
    sortableName?: string;
    sortable?: boolean;
    filterable?: boolean;
    visible?: boolean;
    showable?: boolean;
    type?: string;
    template?: string;
    customTemplate?: boolean;
    css?: any;
}


export interface IGridRow {
    columns: {};
}
export interface IGridResults {
    rows: IGridRow[];
    count: number;
}
export interface IGridSort {
    columnName: string;
    descending: boolean;
}

export interface IGrid {
    pageSize: number;
    currentPage: number;
    numberOfPages: number;
    numberOfItems: number;
    searchText: string;


    nextPage(): void;
    previousPage(): void;
    firstPage(): Promise<IGridResults>;
    refreshPage(): Promise<IGridResults>
    lastPage(): void;
    goToPage(p: number): Promise<IGridResults>;

    columns: IGridColumn[];
    rows: IGridRow[];
}

export interface IGridSearchableColumn {
    name: string;
}

export interface IGridDataSource {
    sorts: IGridSort[];
    getPage(take: number, skip: number, searchText: string, orderbyText: string): Promise<IGridResults>;
    count: number;
    searchableColumns?: IGridSearchableColumn[];
}

