import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import * as _ from 'lodash';
import { RiskMeasuringService } from '../risk-measuring.service';

@Component({
    selector: 'app-risk-measuring',
    templateUrl: './risk-measuring.component.html',
    styleUrls: ['./risk-measuring.component.scss'],
    encapsulation: ViewEncapsulation.Emulated,
})
export class RiskMeasuringComponent implements OnInit {
    hasData = false;
    loading = true;
    form: FormGroup = this.fb.group({
        date: new FormControl(new Date('2019-01-30')),
        owner: new FormControl('', [Validators.required]),
        confidenceInterval: new FormControl('99'),
    });
    barChart: any;
    gage: any;

    public chartType = 'line';
    public chartDatasets: Array<any> = [{ data: [], label: '' }];
    public chartLabels: Array<any> = [];
    public chartColors: Array<any> = [
        {
            backgroundColor: 'transparent',
            borderColor: this.generateRandomColor(),
            borderWidth: 1,
        },
    ];
    public chartOptions: any = { responsive: true };

    showingData = [];

    showingDataColumns = [
        { name: 'VaR', id: 'VaR', type: 'number', minWidth: '130px', headerAlign: 'center', dataAlign: 'center' },
        {
            name: 'Upper bound VaR',
            id: 'upperBoundVar',
            type: 'string',
            minWidth: '150px',
            headerAlign: 'center',
            dataAlign: 'center',
        },
        {
            name: 'worstVaR',
            id: 'worstVaR',
            type: 'number',
            minWidth: '150px',
            headerAlign: 'center',
            dataAlign: 'center',
        },
        {
            name: 'Provision',
            id: 'provision',
            type: 'number',
            minWidth: '150px',
            headerAlign: 'center',
            dataAlign: 'center',
        },
    ];

    showingDataColumns2 = [
        {
            name: 'VaR/سرمایه',
            id: 'VaR',
            type: 'number',
            minWidth: '130px',
            headerAlign: 'center',
            dataAlign: 'center',
        },
        {
            name: 'Upper bound VaR/سرمایه',
            id: 'upperBoundVar',
            type: 'string',
            minWidth: '150px',
            headerAlign: 'center',
            dataAlign: 'center',
        },
        {
            name: 'worst VaR/سرمایه',
            id: 'worstVaR',
            type: 'number',
            minWidth: '150px',
            headerAlign: 'center',
            dataAlign: 'center',
        },
        {
            name: 'Provision/سرمایه',
            id: 'provision',
            type: 'number',
            minWidth: '150px',
            headerAlign: 'center',
            dataAlign: 'center',
        },
    ];
    showingData2 = [];

    constructor(private riskMeasuringService: RiskMeasuringService, private fb: FormBuilder) {}

    ngOnInit(): void {}

    public submitForm(): void {
        const searchParams = this.form.value;
        this.loading = false;
        searchParams.date = this.form.value.date.toISOString().split('T')[0];
        this.riskMeasuringService.getRiskManagementValues(searchParams).subscribe((result) => {
            this.loading = true;
            this.hasData = true;
            this.barChart = result.histogramPL.dataset[0].data;
            this.gage = result.VaR.toFixed(3);
            this.createChart(result.historicalVaR.plot);
            this.showingData.push({
                VaR: result.VaR_rial,
                upperBoundVar: result.upperBound_VaR_rial,
                worstVaR: result.worstVaR_rial_ratio,
                provision: result.provision,
            });
            this.showingData2.push({
                VaR: result.VaR_rial_ratio,
                upperBoundVar: result.upperBound_VaR_rial,
                worstVaR: result.worstVaR_rial_ratio,
                provision: result.provision_ratio,
            });
        });
    }

    public OptionAllState(controlName: string, values: Array<any>, key = 'id'): 'all' | 'indeterminate' | 'none' {
        const control: AbstractControl = this.form.controls[controlName];
        const mappedValues = _.map(_.map(values, key), (value) => value.toString());
        const difference = _.difference(mappedValues, control.value).length;
        if (difference === 0) {
            return 'all';
        } else if (difference === values.length) {
            return 'none';
        }
        return 'indeterminate';
    }

    public selectAllHandler(checkbox: MatCheckbox, controlName: string, values: Array<any>, key = 'id'): void {
        if (checkbox.checked) {
            this.form.controls[controlName].patchValue(_.map(_.map(values, key), (value) => value.toString()));
        } else {
            this.form.controls[controlName].patchValue([]);
        }
    }

    private createChart(dataArray): void {
        const labels = [];
        const data = [];
        dataArray.forEach((element) => {
            data.push(element.VaR);
            const date = new Date(element.date).toLocaleDateString('fa-Ir', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            if (!labels.includes(date)) labels.push(date);
        });
        this.chartDatasets[0].data = data;
        this.chartLabels = labels;
    }

    private generateRandomColor(): string {
        const x = Math.floor(Math.random() * 256);
        const y = Math.floor(Math.random() * 256);
        const z = Math.floor(Math.random() * 256);
        return 'rgb(' + x + ',' + y + ',' + z + ')';
    }
}
