import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import * as _ from 'lodash';
import { forkJoin, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IpsDialogComponent } from '#shared/components/ips-dialog/ips-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UtilityFunctions } from '#shared/utilityFunctions';
import { AUMService } from 'app/modules/aum/aum.service';
import { StateManager } from 'app/shared/pipes/stateManager.pipe';
import { AumData, Baskets, Category, Fund, SearchParams } from './aum-models';

@Component({
    selector: 'app-aum',
    templateUrl: './aum.component.html',
    styleUrls: ['./aum.component.scss'],
    providers: [AUMService],
    animations: [fuseAnimations],
})
export class AumComponent implements OnInit {
    baskets: Array<Baskets>;
    categories: Array<Category>;
    funds: Array<Fund>;
    form: FormGroup;
    searchParams: SearchParams = {
        tamadonAssets: false,
        fundNationalCodes: [],
        date: undefined,
        listedAssets: false,
        nonlistedAssets: false,
        bondsAssets: false,
        stocksAssets: false,
        fundsAssets: false,
    };
    @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
    fundsControlRequired: boolean = false;

    aumData: AumData = {
        etf: { data: {}, state: 'INIT' },
        bond: { data: {}, state: 'INIT' },
        nlBond: { data: {}, state: 'INIT' },
        stocks: { data: {}, state: 'INIT' },
        nlStocks: { data: {}, state: 'INIT' },
        funds: { data: {}, state: 'INIT' },
        nlFunds: { data: {}, state: 'INIT' },
        deposit: { data: {}, state: 'INIT' },
    };
    hasSubmitButtonClicked: boolean = false;
    didAllAumDateCame: boolean = false;

    constructor(
        private aumService: AUMService,
        private fb: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.createForm();
        forkJoin([this.getAUMBaskets(), this.getAUMCategories()]).subscribe(() => {
            this.setFormValueFromParams();
            this.getAUMFund().subscribe(() => {
                this.setFormValueFromParams();
                this.form.get('baskets').valueChanges.subscribe((value: Array<string>) => {
                    value.includes('2') ? this.form.addControl('funds', new FormControl([], Validators.required)) : this.form.removeControl('funds');
                    this.getAUMFund();
                });
                this.form.valueChanges.subscribe((formValue) => this.addRouterParamsOnFormValueChanges(formValue));
            });
        });
        this.form.controls.baskets.valueChanges.subscribe((value) => {
            if (value.includes('2')) {
                this.fundsControlRequired = true;
                this.form.controls.funds.setValidators([Validators.required]);
            } else {
                this.fundsControlRequired = false;
                this.form.controls.funds.setValidators([]);
            }
        });
    }

    public getAUMFundOnBasketChange(): void {
        this.aumService.getAUMFund(this.form.get('baskets').value).subscribe((response) => (this.funds = response));
    }

    public submitForm(): void {
        Object.keys(this.aumData).map((key) => (this.aumData[key].state = 'INIT'));
        // the above line is for setting back every tab to disable by default
        this.gatherDataForSearchParams();
        this.hasSubmitButtonClicked = true;
        this.didAllAumDateCame = false;
        const $forkAllCalls: Array<Observable<any>> = [];

        setTimeout(() => {
            this.form.get('categories').value.forEach((element) => {
                this.form.get('NL').value.forEach((isBourse) => {
                    if (isBourse == 0) {
                        if (element == 2) {
                            $forkAllCalls.push(this.getAumStock(false));
                        } else if (element == 1) {
                            $forkAllCalls.push(this.getAumBond(false));
                        } else if (element == 4) {
                            $forkAllCalls.push(this.getAumFund(false));
                        }
                    } else if (isBourse == 1) {
                        if (element == 1) {
                            $forkAllCalls.push(this.getAumBond());
                        } else if (element == 2) {
                            $forkAllCalls.push(this.getAumStock());
                        } else if (element == 4) {
                            $forkAllCalls.push(this.getAumFund());
                        }
                    }
                });
                // if (element == 3) this.getAumDeposit();
                // the category with the id of 3 has been removed for now!
            });

            if (this.form.get('baskets').value.length > 1 || this.form.get('categories').value.length > 1 || this.form.get('NL').value.length > 1)
                $forkAllCalls.push(this.getAumEtf());
        }, 100);
        // 100 ms delay is because angular bug: not detecting changes fast

        setTimeout(() => {
            forkJoin($forkAllCalls).subscribe(() => {
                this.hasSubmitButtonClicked = false;
                this.didAllAumDateCame = true;
                const aumArray = _.values(this.aumData);
                let counter = 0;
                setTimeout(() => {
                    for (const aumObject of aumArray) {
                        if (aumObject.state === 'PRESENT' && this.tabGroup) {
                            this.tabGroup.selectedIndex = counter;
                            break;
                        }
                        counter++;
                    }
                }, 200);
            });
        }, 200);
    }

    public OptionAllState(controlName: string, values: Array<any>, key = 'id'): 'all' | 'indeterminate' | 'none' {
        const control: AbstractControl = this.form.controls[controlName];
        const mappedValues = _.map(_.map(values, key), (value) => value.toString());
        const difference = _.difference(mappedValues, control.value).length;
        if (difference === 0) return 'all';
        else if (difference === values.length) return 'none';
        return 'indeterminate';
    }

    public selectAllHandler(checkbox: MatCheckbox, controlName: string, values: Array<any>, key = 'id'): void {
        if (checkbox.checked) {
            this.form.controls[controlName].setValue(_.map(_.map(values, key), (value) => value.toString()));
        } else {
            this.form.controls[controlName].patchValue([]);
        }

        if (controlName === 'baskets' && checkbox.checked) {
            this.getAUMFundOnBasketChange();
        }
    }

    public filterCategories(): Array<Category> {
        let categories = [];
        if (this.categories) {
            categories = this.categories.filter((row) => row.id !== 3);
        }
        return categories;
    }

    public openIpsHistoryDialog(): void {
        this.dialog.open(IpsDialogComponent, {
            width: '1000px',
            data: { basket: ['T', 'F', 'M'], withDetails: false },
        });
    }

    private createForm(): void {
        this.form = this.fb.group({ NL: [[], []], baskets: [[], []], categories: [[], []], date: [], funds: [[], []] });
    }

    private setFormValueFromParams(): void {
        const params = this.activatedRoute.snapshot.queryParams;
        this.checkParamsForBeingArray(params, ['baskets', 'NL', 'categories', 'funds']);
        this.form.get('date').setValue(new Date(params.date) ?? new Date());
    }

    private checkParamsForBeingArray(params: Params, paramNameArray: Array<string>): void {
        paramNameArray.forEach((element) => {
            Array.isArray(params[element])
                ? this.form.get(element).patchValue(params[element].map((el) => el))
                : this.form.get(element).patchValue([params[element]]);
        });
    }

    private getAUMBaskets(): Observable<any> {
        return this.aumService.getAUMBaskets().pipe(tap((response) => (this.baskets = response)));
    }

    private getAUMCategories(): Observable<any> {
        return this.aumService.getAUMCategories().pipe(tap((response) => (this.categories = response)));
    }

    // *** method for getting data on formSubmit ***
    // *** these methods should be on each component's ngOnInits and each component should have its own route in the next refactor ***
    // private getAumDeposit(): void {
    //     this.aumService
    //         .getAumDeposit(this.searchParams.tamadonAssets, this.searchParams.date, this.form.get('funds').value)
    //         .pipe(StateManager(this.aumData.deposit))
    //         .subscribe((result) => (this.aumData.deposit.data = result));
    // }

    private getAUMFund(): Observable<any> {
        return this.aumService.getAUMFund(this.form.get('baskets').value).pipe(tap((response) => (this.funds = response)));
    }

    private addRouterParamsOnFormValueChanges(formValue): void {
        let newFormValue = { ...formValue };
        newFormValue = this.removeEmptyOrNullValuesFromForm(newFormValue);
        const inputDate = new Date(newFormValue?.date);
        !!inputDate.getDate() ? (newFormValue.date = UtilityFunctions.convertDateToGregorianFormatForServer(inputDate)) : delete newFormValue.date;
        this.router
            .navigate([], {
                relativeTo: this.activatedRoute,
                queryParams: newFormValue,
                queryParamsHandling: '',
            })
            .finally();
    }

    private removeEmptyOrNullValuesFromForm(formValue): any {
        for (const propName in formValue)
            if (formValue.hasOwnProperty(propName)) {
                if (formValue[propName] === null || formValue[propName] === '' || (formValue[propName][0] === undefined && propName !== 'date'))
                    delete formValue[propName];
            }

        return formValue;
    }

    private gatherDataForSearchParams(): void {
        this.searchParams.tamadonAssets = this.form.get('baskets').value.includes('1');
        this.searchParams.date = UtilityFunctions.convertDateToGregorianFormatForServer(this.form.get('date').value);
        this.searchParams.listedAssets = this.form.value.NL.includes('0');
        this.searchParams.nonlistedAssets = this.form.value.NL.includes('1');
        this.searchParams.bondsAssets = this.form.get('categories').value.includes('1');
        this.searchParams.stocksAssets = this.form.get('categories').value.includes('2');
        this.searchParams.fundsAssets = this.form.get('categories').value.includes('4');

        if (this.form.get('baskets').value.includes('2')) this.searchParams.fundNationalCodes = this.form.get('funds').value;
        else delete this.searchParams.fundNationalCodes;
    }

    private getAumStock(isNl: boolean = true): Observable<any> {
        return isNl
            ? this.aumService.getAumNLStocks(this.searchParams).pipe(
                  StateManager(this.aumData.nlStocks),
                  tap((result) => (this.aumData.nlStocks.data = result))
              )
            : this.aumService.getAumStocks(this.searchParams).pipe(
                  StateManager(this.aumData.stocks),
                  tap((result) => (this.aumData.stocks.data = result))
              );
    }

    private getAumBond(isNl: boolean = true): Observable<any> {
        return isNl
            ? this.aumService.getAumNlBond(this.searchParams).pipe(
                  StateManager(this.aumData.nlBond),
                  tap((result) => (this.aumData.nlBond.data = result))
              )
            : this.aumService.getAumBond(this.searchParams).pipe(
                  StateManager(this.aumData.bond),
                  tap((result) => (this.aumData.bond.data = result))
              );
    }

    private getAumFund(isNl: boolean = true): Observable<any> {
        return isNl
            ? this.aumService.getAumNlFunds(this.searchParams).pipe(
                  StateManager(this.aumData.nlFunds),
                  tap((result) => (this.aumData.nlFunds.data = result))
              )
            : this.aumService.getAumFunds(this.searchParams).pipe(
                  StateManager(this.aumData.funds),
                  tap((result) => (this.aumData.funds.data = result))
              );
    }

    private getAumEtf(): Observable<any> {
        return this.aumService.getAumEtf(this.searchParams).pipe(
            StateManager(this.aumData.etf),
            tap((result) => (this.aumData.etf.data = result))
        );
    }
}
