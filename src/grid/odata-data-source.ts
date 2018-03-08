import { IGridDataSource, IGridResults, IOrderBy, IGridSearchableColumn } from "./interfaces";

import * as URI from "urijs";

export class OdataParams {
    public take: number;
    public skip: number;
    public filter: string;
    public orderby: string;

    public makeQueryParams(): string {
        let result = this.makeQueryParamObj();
        let uri = new URI("");
        uri.addQuery(result);
        let querystring = uri.query() + "&";
        if (querystring[0] == "?") {
            querystring = querystring.substr(1);
        }
        return querystring;
    }

    public makeQueryParamObj(): any {
        const shouldIncludeFilter = this.filter != null && (typeof this.filter != "string" || this.filter !== "");
        const shouldIncludeOrderby = this.orderby != null && (typeof this.orderby != "string" || this.orderby !== "");
        let result = {
            "$count": "true",
        };
        if (this.take > 0) {
            result["$top"] = this.take;
        }

        if (this.skip > 0) {
            result["$skip"] = this.skip;
        }

        if (shouldIncludeFilter) {
            result["$filter"] = this.filter;
        }

        if (shouldIncludeOrderby) {
            result["$orderby"] = this.orderby;
        }
        return result;
    }

    public static serializeString(str: string): string {
        let escapedStr = str.replace(/'/g, "''");
        return "'" + escapedStr + "'";
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

