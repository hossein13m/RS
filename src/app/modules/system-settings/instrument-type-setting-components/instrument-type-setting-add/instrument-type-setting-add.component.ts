import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from '#shared/services/alert.service';
import { BourseBoardService } from 'app/services/feature-services/system-setting-services/bourse-board.service';
import { BourseMarketService } from 'app/services/feature-services/system-setting-services/bourse-market.service';
import { InstrumentTypeService } from 'app/services/feature-services/system-setting-services/instrument-type.service';

@Component({
    selector: 'app-instrument-type-setting-add',
    templateUrl: './instrument-type-setting-add.component.html',
    styleUrls: ['./instrument-type-setting-add.component.scss'],
})
export class InstrumentTypeSettingAddComponent implements OnInit {
    form: FormGroup;
    banks = [];
    title = '';
    markets = [];
    boards = [];

    constructor(
        public dialogRef: MatDialogRef<InstrumentTypeSettingAddComponent>,
        private bourseMarketService: BourseMarketService,
        private alertService: AlertService,
        private instrumentTypeService: InstrumentTypeService,
        private bourseBoardService: BourseBoardService,
        @Inject(MAT_DIALOG_DATA) public data,
        private fb: FormBuilder
    ) {}

    getBoard(): void {
        this.bourseBoardService.get().subscribe((res: any) => {
            this.boards = res;
        });
    }

    getMarket(): void {
        this.bourseMarketService.getBourses(this).subscribe((res: any) => {
            this.markets = res;
        });
    }

    ngOnInit(): void {
        if (this.data) {
            this.title = 'ویرایش ';
        } else {
            this.title = 'ایجاد ';
        }
        this.creatForm();
        this.getBoard();
        this.getMarket();
    }

    creatForm(): void {
        this.form = this.fb.group({
            type: new FormControl({ value: this.data ? this.data.type : '', disabled: false }),
            ticker: new FormControl({ value: this.data ? this.data.ticker : '', disabled: true }),
            status: new FormControl({ value: this.data ? this.data.status : '', disabled: true }),
            name: new FormControl({ value: this.data ? this.data.name : '', disabled: true }),
            symbol: new FormControl({ value: this.data ? this.data.symbol : '', disabled: true }),
            isInBourse: new FormControl({ value: this.data ? this.data.isInBourse : '', disabled: true }),
        });
    }

    onCreateBranch(): void {
        this.instrumentTypeService.updateInstrumentType(this.form.value).subscribe(() => {
            this.alertService.onSuccess('با موفقیت ایجاد شد');
            this.dialogRef.close(true);
        });
    }

    onEditBranch(): void {
        const obj = this.form.value;
        obj['ticker'] = this.data.ticker;
        obj['type'] = this.form.get('type').value;
        obj['isInBourse'] = this.data.isInBourse;
        this.instrumentTypeService.updateInstrumentType(obj).subscribe(() => {
            this.alertService.onSuccess('با موفقیت ویرایش شد');
            this.dialogRef.close(obj);
        });
    }

    close(): void {
        this.dialogRef.close(false);
    }
}
