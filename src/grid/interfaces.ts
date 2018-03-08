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

    rows: IGridRow[];
}

export interface IGridSearchableColumn {
    name: string;
}

export interface IOrderBy {
    name: string;
    ascending: boolean;
}

export interface IGridDataSource {
    getPage(take: number, skip: number, searchText: string, orderby: IOrderBy): Promise<IGridResults>;
    searchableColumns?: IGridSearchableColumn[];
}

