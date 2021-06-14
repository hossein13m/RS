import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ResponseWithPagination } from '#shared/models/pagination.model';
import { Observable } from 'rxjs';
import { UtilityFunctions } from '#shared/utilityFunctions';
import { Organization, User } from './user.model';

@Injectable()
export class UserService {
    constructor(private http: HttpClient) {}

    public getUsers(organization: string, paginationParams?, searchParams?): Observable<ResponseWithPagination<User>> {
        const params: HttpParams = UtilityFunctions.prepareParamsFromObjectsForAPICalls({ organization, ...paginationParams, ...searchParams });
        return this.http.get<ResponseWithPagination<User>>('/api/v2/user', { params });
    }

    public getOrganizations(searchKeyword?: string): Observable<ResponseWithPagination<Organization>> {
        const params: HttpParams = UtilityFunctions.prepareParamsFromObjectsForAPICalls({ limit: 20, skip: 0, name: searchKeyword ? searchKeyword : '' });
        return this.http.get<ResponseWithPagination<Organization>>('/api/v1/organization', { params });
    }

    public createUser(model: User): Observable<User> {
        return this.http.post<User>('/api/v2/user', model);
    }

    public updateUser(model: User): Observable<User> {
        return this.http.put<User>('/api/v2/user', model);
    }
}