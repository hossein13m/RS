import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AssetsMonitoringIPSHistory } from '../assets-monitoring.model';
import { AssetsMonitoringService } from '../assets-monitoring.service';

@Component({
    selector: 'app-assets-monitoring-ips-dialog',
    templateUrl: './assets-monitoring-ips-dialog.component.html',
    styleUrls: ['./assets-monitoring-ips-dialog.component.scss'],
})
export class AssetsMonitoringIpsDialogComponent implements OnInit {
    columns: Array<{ name: string; id: string; type: string; convert?: any }>;
    loading: boolean = true;
    tableData: Array<AssetsMonitoringIPSHistory> = [];

    constructor(private assetsMonitoringService: AssetsMonitoringService) {}

    ngOnInit(): void {
        this.initiateColumns();
        this.getAssetsMonitoringIPSHistory();
    }

    private initiateColumns(): void {
        this.columns = [
            { name: 'سبد', id: 'organizationType', type: 'string' },
            {
                name: 'کارگزاری',
                id: 'broker',
                type: 'string',
                convert: (value: string | null) => (value ? value : '-'),
            },
            {
                name: 'تاریخ',
                id: 'date',
                type: 'date',
                convert: (value: any) => new Date(value).toLocaleDateString('fa-Ir', { year: 'numeric', month: 'long', day: 'numeric' }),
            },
        ];
    }

    private getAssetsMonitoringIPSHistory(): void {
        let searchParams = {
            basket: ['T', 'F', 'M'], // for some reason this is the type of IPS history for assets monitoring section
            date: formatDate(new Date(), 'yyyy-MM-dd', 'en_US'),
        };
        this.assetsMonitoringService.getAssetsMonitoringIPSHistory(searchParams).subscribe((response) => {
            this.loading = false;
            this.tableData = response.items;
        });
    }
}
