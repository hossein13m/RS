import * as am4core from '@amcharts/amcharts4/core';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TableDialogComponent } from 'app/shared/components/table-dialog/table-dialog.component';
import { Column } from '#shared/components/table/table.model';

am4core.useTheme(am4themes_animated);

interface AumNlBond {
    pieChart: Array<any>;
    table: Array<any>;
}

@Component({
    selector: 'aum-nl-bonds',
    templateUrl: './aum-nl-bonds.component.html',
    styleUrls: ['./aum-nl-bonds.component.scss'],
})
export class AumNlBondsComponent {
    columns: Array<Column> = [];
    @Input() aumNlBond: AumNlBond;

    constructor(public dialog: MatDialog) {
        this.createColumn();
    }

    createColumn(): void {
        this.columns = [
            { name: 'نام', id: 'name', type: 'string' },
            { name: 'درصد کل دارایی', id: 'percentageOfAssets', type: 'number' },
            { name: 'درصد کل سبداوراق', id: 'percentageOfBonds', type: 'number' },
            { name: 'نرخ سود اسمی', id: 'couponRate', type: 'number' },
            { name: 'ارزش', id: 'value', type: 'price' },
            {
                id: 'rowDetail',
                type: 'rowDetail',
                click: (row) => console.log('row clicked once', row),
                doubleClickable: true,
                doubleClick: (row) => {
                    const dialogRef = this.dialog.open(TableDialogComponent, {
                        width: '80vw',
                        data: {
                            title: row.name,
                            columns: [
                                {
                                    name: 'حجم',
                                    id: 'volume',
                                    type: 'number',
                                    headerAlign: 'center',
                                    dataAlign: 'center',
                                },
                                {
                                    name: 'ارزش',
                                    id: 'value',
                                    type: 'price',
                                    headerAlign: 'center',
                                    dataAlign: 'center',
                                },
                                { name: 'نام', id: 'name', type: 'string', headerAlign: 'center', dataAlign: 'center' },
                            ],
                            data: row.details,
                        },
                    });
                },
            },
        ];
    }
}
