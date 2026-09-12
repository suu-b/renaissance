import { FilterObject, SortObject } from "@renaissance/shared";

export interface SearchParams {
    limit?: number;
    offset?: number;
    sort?: SortObject;
    filters?: FilterObject[];
    fields?: string[];
}

export interface SearchResult<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
}

export class DataService {
    static applyFilters<T>(
        items: T[], 
        filters: FilterObject[], 
        valueAccessor: (item: T, field: string) => any
    ): T[] {
        if (!filters || filters.length === 0) return items;
        
        return items.filter(item => {
            return filters.every(filter => {
                const fieldValue = valueAccessor(item, filter.field);
                
                switch (filter.operator) {
                    case "eq":
                        return String(fieldValue) === String(filter.value);
                    case "neq":
                        return String(fieldValue) !== String(filter.value);
                    case "contains":
                        return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
                    case "startsWith":
                        return String(fieldValue).toLowerCase().startsWith(String(filter.value).toLowerCase());
                    case "endsWith":
                        return String(fieldValue).toLowerCase().endsWith(String(filter.value).toLowerCase());
                    case "gt":
                        return Number(fieldValue) > Number(filter.value);
                    case "lt":
                        return Number(fieldValue) < Number(filter.value);
                    case "gte":
                        return Number(fieldValue) >= Number(filter.value);
                    case "lte":
                        return Number(fieldValue) <= Number(filter.value);
                    case "in":
                        return String(filter.value).split(',').map(v => v.trim()).includes(String(fieldValue));
                    case "notIn":
                        return !String(filter.value).split(',').map(v => v.trim()).includes(String(fieldValue));
                    case "exists":
                        return fieldValue !== undefined && fieldValue !== null;
                    case "between":
                        const [min, max] = String(filter.value).split(',').map(Number);
                        return Number(fieldValue) >= min && Number(fieldValue) <= max;
                    default:
                        return true;
                }
            });
        });
    }

    static applySorting<T>(
        items: T[], 
        sort: SortObject, 
        valueAccessor: (item: T, field: string) => any
    ): T[] {
        if (!sort) return items;
        
        return [...items].sort((a, b) => {
            const aValue = valueAccessor(a, sort.field);
            const bValue = valueAccessor(b, sort.field);
            
            let comparison = 0;
            if (aValue < bValue) comparison = -1;
            if (aValue > bValue) comparison = 1;
            
            return sort.order === "desc" ? -comparison : comparison;
        });
    }

    static applyPagination<T>(items: T[], limit: number, offset: number): SearchResult<T> {
        const total = items.length;
        const paginatedItems = items.slice(offset, offset + limit);
        
        return {
            items: paginatedItems,
            total,
            limit,
            offset
        };
    }

    static applyFieldSelection<T>(
        items: T[], 
        fields: string[], 
        valueAccessor: (item: T, field: string) => any
    ): any[] {
        if (!fields || fields.length === 0) return items;
        
        return items.map(item => {
            const selected: any = {};
            fields.forEach(field => {
                selected[field] = valueAccessor(item, field);
            });
            return selected;
        });
    }

    static processSearch<T>(
        items: T[],
        params: SearchParams,
        valueAccessor: (item: T, field: string) => any = (item, field) => (item as any)[field]
    ): SearchResult<T> {
        let result = items;
        
        if (params.filters) {
            result = this.applyFilters(result, params.filters, valueAccessor);
        }
        
        if (params.sort) {
            result = this.applySorting(result, params.sort, valueAccessor);
        }
        
        const paginatedResult = this.applyPagination(
            result, 
            params.limit || 25, 
            params.offset || 0
        );
        
        if (params.fields && params.fields.length > 0) {
            paginatedResult.items = this.applyFieldSelection(
                paginatedResult.items, 
                params.fields, 
                valueAccessor
            );
        }
        
        return paginatedResult;
    }
}