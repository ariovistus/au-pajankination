export interface IComboboxDataSource {
    /**
     * Gets a page of items. If skip + take > number of items in data stream, return any items
     * that are available, otherwise return take items
     */
    getPage(take: number, skip: number, searchText: string): Promise<IComboboxResults>;
    /** 
     * Gets the index of the specified row in the data stream.
     * If the specified row does not exist, reject the promise.
     */
    getIndex(id: IComboboxRowId): Promise<number>;
    /**
     * Gets the id field of an item
     */
    getId(item: IComboboxRow): IComboboxRowId;
}

export interface IComboboxResults {
    rows: IComboboxRow[];
    count: number;
}

export interface IComboboxRow {
    _element?: Element;
    _isMatch?: boolean;
}

export interface IComboboxRowId {
}

