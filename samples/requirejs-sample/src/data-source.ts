
import { IComboboxDataSource, IComboboxResults } from "au-pajankination/interfaces";
import { IGridDataSource, IGridResults } from "au-pajankination/grid/interfaces";


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

export class SpoofedDataSource2 implements IGridDataSource {
    public sorts = [];
    public count = 0;
    public getIndex(id: any): Promise<number> {
        return Promise.resolve(id);
    }

    public getId(item: any): any {
        return item.id;
    }

    public getPage(take: number, skip: number, searchText: string, orderbyText: string): Promise<IGridResults> {
        console.info("orderby: ", searchText);
        let actualTake = Math.min(take, 100);
        let d = 1;
        if(searchText != null) {
            d = parseInt(searchText.substring(1+searchText.indexOf("'"), searchText.lastIndexOf("'")));
            if(isNaN(d)) {
                d = 1;
            }
        }
        console.info("orderby: ", d);
        let count = 100000;

        var page = [];
        if(orderbyText == "id desc") {
            var i = count-skip*d-1;
            while(i >= 0 && page.length < actualTake) {
                if(i >= count) continue;
                let obj = {
                    id: i
                };
                if(i % d == 0) {
                    page.push(obj);
                    i-=d;
                }else{
                    i--;
                }
            }
        }else{
            var i = skip*d;
            while(i < count && page.length < actualTake) {
                if(i >= count) continue;
                let obj = {
                    id: i
                };
                if(i % d == 0) {
                    page.push(obj);
                    i+=d;
                }else{
                    i++;
                }
            }
        }

        return new Promise(function(resolve) {
            setTimeout(function() {
                resolve({
                    count: Math.floor(count / d),
                    rows: page
                });
            }, 34);
        });
    }

    searchableColumns = [{name: 'id'}];
}
