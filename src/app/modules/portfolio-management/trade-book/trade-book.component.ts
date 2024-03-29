import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { PMRoutePrefix } from '../portfolio-management.module';
import { TradeBookHistoryComponent } from './trade-book-history/trade-book-history.component';
import { TradeBookService } from './trade-book.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StateType } from '#shared/state-type.enum';
import { Column } from '#shared/components/table/table.model';
import * as _ from 'lodash';
import { TradeBook } from './trade-book.model';
import { UtilityFunctions } from '#shared/utilityFunctions';

@Component({
    selector: 'app-trade-book',
    templateUrl: './trade-book.component.html',
    styleUrls: ['./trade-book.component.scss'],
    animations: [fuseAnimations],
})
export class TradeBookComponent implements OnInit {
    stateType: StateType = StateType.INIT;
    column: Array<Column>;
    form: FormGroup = this.fb.group({ date: [new Date()], tradingBook: [[]] });
    tradeBooksList: Array<{ id: number; name: string }> = [];
    tradeBookData: Array<TradeBook> = [];
    selectedTradingBook: TradeBook;
    displayedColumns: Array<string> = ['position', 'bourseAccount', 'volume', 'vwap', 'asset', 'brokerName', 'btt', 'vwapUpdateDate', 'operations'];
    dataSource: Array<any> = [];

    constructor(private router: Router, private dialog: MatDialog, public tradingBookService: TradeBookService, private fb: FormBuilder) {}

    ngOnInit(): void {
        this.getAllTradingBooks();
        this.initializeTableColumns();
    }

    public showBook(organizationType: string, ticker: any, pamCode: string): void {
        const date = new Date(this.form.value.date).getTime();
        this.router.navigate([`/${PMRoutePrefix}/book`, date, organizationType, ticker, pamCode]).finally();
    }

    public OnDateChange(): void {
        this.selectedTradingBook = null;
        this.getAllTradingBooks();
    }

    public onTradeBookChange(event: number): void {
        this.selectedTradingBook = this.tradeBookData[event];
        this.createTableData(this.tradeBookData[event].details);
    }

    public showHistory(): void {
        this.dialog.open(TradeBookHistoryComponent, { panelClass: 'dialog-w50', data: { date: this.form.value.date } });
    }

    private initializeTableColumns(): void {
        this.column = [
            { id: 'row', name: '#', type: 'string' },
            { id: 'bourseAccount', name: 'نماد', type: 'string' },
            { id: 'volume', name: 'حجم', type: 'number' },
            { id: 'vwap', name: 'قیمت روز', type: 'price' },
            { id: 'asset', name: 'ارزش بازار', type: 'price' },
            { id: 'brokerName', name: 'کارگزار', type: 'string' },
            { id: 'btt', name: 'بهای تمام شده‌ی کل', type: 'price' },
            {
                id: 'btt',
                name: 'آخرین تاریخ بروزرسانی قیمت',
                type: 'date',
                convert: (value: unknown) => (value ? value : '-'),
            },
            {
                name: 'عملیات',
                id: 'operation',
                type: 'operation',
                minWidth: '130px',
                sticky: true,
                operations: [
                    {
                        name: 'ویرایش',
                        icon: 'visibility',
                        color: 'accent',
                        operation: ({ row }: any) => this.showBook(row.organizationType, row.ticker, row.pamCode),
                    },
                ],
            },
        ];
    }

    private getAllTradingBooks(): void {
        this.stateType = StateType.LOADING;
        const date = UtilityFunctions.convertDateToGregorianFormatForServer(this.form.value.date);
        this.tradeBooksList = [];
        this.form.get('tradingBook').reset();
        if (this.dataSource) this.dataSource = _.take(this.dataSource, 0);

        this.tradingBookService.getTradingBooks(date).subscribe(
            (result: Array<{ details: Array<any>; organization: string; totalAssets: string }>) => {
                this.stateType = StateType.PRESENT;
                this.tradeBookData = result;
                this.handleTradingBooksDate();
                result.map((element, index: number) =>
                    this.tradeBooksList.push({
                        id: index,
                        name: element.organization,
                    })
                );
            },
            () => (this.stateType = StateType.FAIL)
        );
    }

    private handleTradingBooksDate(): void {
        this.tradeBookData.map((element) => {
            if (element && element.details) {
                element.details.forEach((detail) => {
                    let date;
                    if (detail.vwapAdjusted !== null) date = detail.vwapAdjustedUpdateDate;
                    if (detail.vwap !== null) date = detail.vwapUpdateDate;
                    if (detail.vwapAdjusted !== null && detail.vwap !== null) date = detail.vwapAdjustedUpdateDate;
                    if (!date) return;
                    detail.dateFa = new Date(date).toLocaleDateString('fa-Ir', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                    });
                });
            }
        });
    }

    private createTableData(data): void {
        if (!data) return;
        this.dataSource = [...data];
    }
}
