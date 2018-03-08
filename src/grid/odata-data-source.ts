import { IGridDataSource, IGridResults, IOrderBy, IGridSearchableColumn } from "./interfaces";

export class OdataParams {
    public take: number;
    public skip: number;
    public filter: string;
    public orderby: string;

    public makeQueryParams(): string {
        return "";
    }

    public makeQueryParamObj(): any {
        return {};
    }

    public serializeString(str: string): string {
        return str;
    }
}

export abstract class OdataDataSource implements IGridDataSource {
    searchableColumns: IGridSearchableColumn[];

    public abstract odataRequest(odata: OdataParams): Promise<IGridResults>;

    public getPage(take: number, skip: number, searchText: string, orderby: IOrderBy): Promise<IGridResults> {
        let odataParams = new OdataParams();
        odataParams.take = take;
        odataParams.skip = skip;
        odataParams.filter = this.buildFilter(searchText);
        odataParams.orderby = this.buildOrderby(orderby);

        return Promise.resolve({count: 0, rows: []});
    }

    public buildFilter(searchText: string): string {
        if (searchText == null || searchText.trim() == "") {
            return null;
        }

        var columns = this.searchableColumns || [];

        var filter = columns.map(column => this.substringOfPart(searchText, column)).join(" or ");
        return filter;
    }

    public buildOrderby(orderby: IOrderBy): string {
        let orderbyResult = null;
        if (orderby.name != null) {
            orderbyResult = orderby.name + (orderby.ascending ? " asc" : " desc");
        }
        return orderbyResult;
    }

    public substringOfPart(searchText: string, column: any): string {
        return `substringof(${this.odataEncodedString(searchText.trim())}, ${column.name}) eq true`;
    }

    public odataEncodedString(str: string): string {
        //EncodeURI does too much for oData
        str = str.replace("?", "%3F")
            .replace(":", "%3A")
            .replace("@", "%40")
            .replace("&", "%26")
            .replace("=", "%3D")
            .replace("+", "%2B")
            .replace("$", "%24")
            .replace("#", "%23");

        var value = str.split("'").join("''");
        value = `'${value}'`;
        return value;
    }
}

