
import { IComboboxDataSource, IComboboxResults } from "au-pajankination/interfaces";


export class SpoofedDataSource implements IComboboxDataSource {
    public getIndex(id: any): Promise<number> {
        return Promise.resolve(id);
    }

    public getId(item: any): any {
        return item.id;
    }

    public getPage(take: number, skip: number, searchText: string): Promise<IComboboxResults> {
        let actualTake = Math.min(take, 100);

        var page = [];
        var searchStart = parseInt(searchText) || 0;
        var start = skip + searchStart;
        for(var i = start; i < start + actualTake; i++) {
            let obj = {
                id: i
            };
            page.push(obj);
        }

        return new Promise(function(resolve) {
            setTimeout(function() {
                resolve({
                    count: 100000,
                    rows: page
                });
            }, 34);
        });
    }
}
