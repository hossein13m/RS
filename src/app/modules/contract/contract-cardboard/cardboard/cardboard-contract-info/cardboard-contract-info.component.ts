import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../../contract-list/contract.service';
import { Contract } from '../../../contract-list/contract.model';
import { UtilityFunctions } from '#shared/utilityFunctions';
import { ActivatedRoute } from '@angular/router';
import { StateType } from '#shared/state-type.enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlertService } from '#shared/services/alert.service';

@Component({
    selector: 'app-cardboard-contract-info',
    templateUrl: './cardboard-contract-info.component.html',
    styleUrls: ['./cardboard-contract-info.component.scss'],
})
export class CardboardContractInfoComponent implements OnInit {
    public contractInfo: Contract;
    public stateType: StateType = StateType.INIT;
    public form: FormGroup = this.fb.group({
        name: [''],
        date: [''],
        customer: [''],
        initializerUser: [''],
    });
    private pagination = { skip: 0, limit: 5, total: 100 };
    private organizationCode: number = UtilityFunctions.getActiveOrganizationInfo('code');

    constructor(
        private readonly contractService: ContractService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly fb: FormBuilder,
        private readonly alertService: AlertService
    ) {}

    ngOnInit(): void {
        this.getContractInfo();
    }

    private getContractInfo(): void {
        const searchParams = {
            ...this.pagination,
            ...{
                organization: this.organizationCode,
                id: this.activatedRoute.snapshot.params.id,
            },
        };
        this.contractService.getContractsList(searchParams).subscribe(
            (response) => {
                this.contractInfo = response.items[0];
                this.form.get('name').setValue(this.contractInfo.name);
                this.form.get('date').setValue(UtilityFunctions.convertDateToPersianDateString(this.contractInfo.createdAt));
                this.form.get('customer').setValue(this.contractInfo.customer.name);
                this.form.get('initializerUser').setValue(this.contractInfo.initializerUser.name);
                this.stateType = StateType.PRESENT;
            },
            (error) => (error.status !== 500 ? this.alertService.onError(error.error.errors[0].messageFA) : this.alertService.onError('خطای سرور'))
        );
    }
}
