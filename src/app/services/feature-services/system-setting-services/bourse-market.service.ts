import { Injectable } from '@angular/core';
import { FormContainer } from '#shared/models/FromContainer';
import { Specification } from '#shared/models/Specification';
import { ApiClientService } from '../../Base/api-client.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BourseMarketService extends Specification {
    private static bourseMarketApi = '/api/v1/bourse-market';

    constructor(private apiClientService: ApiClientService) {
        super();
    }

    get(fc?: FormContainer): Observable<any> {
        const api = BourseMarketService.bourseMarketApi + this.generateSpecificationString();
        return this.apiClientService.get(api, fc);
    }

    create(model, fc?: FormContainer): Observable<any> {
        return this.apiClientService.post(BourseMarketService.bourseMarketApi, model, fc);
    }

    update(model, fc?: FormContainer): Observable<any> {
        return this.apiClientService.put(BourseMarketService.bourseMarketApi, fc, model);
    }

    delete(id, fc?: FormContainer): Observable<any> {
        const api = BourseMarketService.bourseMarketApi + '/' + id;
        return this.apiClientService.delete(api, fc);
    }
}
