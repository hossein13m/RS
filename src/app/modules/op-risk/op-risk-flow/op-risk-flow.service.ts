import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiClientService } from 'app/services/Base/api-client.service';
import { FormContainer } from 'app/shared/models/FromContainer';
import { Specification } from 'app/shared/models/Specification';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class OpRiskFlowService extends Specification {
    private static TreeMappingServiceAPI = '/api/v1/operation-risk/flow';

    constructor(private acs: ApiClientService, private http: HttpClient) {
        super();
    }

    private latestMappingSubject = new BehaviorSubject<any>(null);
    public _latestMapping = this.latestMappingSubject.asObservable();

    get latestMapping() {
        return this.latestMappingSubject.getValue();
    }

    getOpFlows(fc?: FormContainer): Observable<any> {
        let pagingParam = '';
        if (this.specificationModel.skip !== undefined && this.specificationModel.limit !== undefined) {
            pagingParam = '?skip=' + this.specificationModel.skip + '&limit=' + this.specificationModel.limit;
        }
        return this.acs
            .get(OpRiskFlowService.TreeMappingServiceAPI + pagingParam, fc)
            .pipe(tap((mapping) => this.latestMappingSubject.next(mapping)));
    }

    getOpFlow(id, fc?: FormContainer): Observable<any> {
        return this.acs.get(OpRiskFlowService.TreeMappingServiceAPI + `/${id}`, fc).pipe(tap((mapping) => this.latestMappingSubject.next(mapping)));
    }

    createOpFlow(data, fc?: FormContainer): Observable<any> {
        return this.acs.post(OpRiskFlowService.TreeMappingServiceAPI, data, fc).pipe(tap((mapping) => this.latestMappingSubject.next(mapping)));
    }

    updateOpFlow(data, fc?: FormContainer): Observable<any> {
        return this.acs.put(OpRiskFlowService.TreeMappingServiceAPI, fc, data).pipe(tap((mapping) => this.latestMappingSubject.next(mapping)));
    }

    getFlowUsers(fc?: FormContainer): Observable<any> {
        return this.acs.get(OpRiskFlowService.TreeMappingServiceAPI + `/user`, fc).pipe(tap((mapping) => this.latestMappingSubject.next(mapping)));
    }

    // HTTP Standard API Call

    getOPRiskFlowUsers(): Observable<any> {
        return this.http.get('/api/v1/operation-risk/flow/user');
    }

    getOPRiskFlow(pagination: any) {
        return this.http.get<any>(`/api/v1/operation-risk/flow?skip=${pagination.skip * pagination.limit}&limit=${pagination.limit}`);
    }

    toggleOPRiskFlowStatus(flowId: number | string) {
        return this.http.put<any>(`/api/v1/operation-risk/flow/inactive/${flowId}`, {});
    }
}
