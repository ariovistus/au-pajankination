
import { IComboboxDataSource, IComboboxResults } from "./resources/elements/interfaces";


export class SpoofedDataSource implements IComboboxDataSource {
    public getIndex(id: any): Promise<number> {
        return Promise.resolve(id);
    }

    public getId(item: any): any {
        return item.id;
    }

    public getPage(take: number, skip: number, searchText: string): Promise<IComboboxResults> {
        var page = [];
        page.push( {
                id: 1
            });

        return Promise.resolve({
            count: 1,
            rows: page
        });
    }
}
