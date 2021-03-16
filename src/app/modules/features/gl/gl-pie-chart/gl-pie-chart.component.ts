import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { AfterViewInit, Component, Inject, NgZone, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GlService } from 'app/services/feature-services/gl.service';
import { TreeOrderType } from '../gl-tree/gl-tree.component';

@Component({
    selector: 'app-gl-pie-chart',
    templateUrl: './gl-pie-chart.component.html',
    styleUrls: ['./gl-pie-chart.component.scss'],
})
export class GlPieChartComponent implements OnInit, AfterViewInit {
    chart;
    pieSeries;
    button;
    drillLevel = [];
    selectedSlice;

    constructor(
        public dialogRef: MatDialogRef<GlPieChartComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public glService: GlService,
        private zone: NgZone
    ) {}

    ngOnInit() {
        if (this.data) {
            this.data.map((x) => {
                x.type = TreeOrderType.Category;
                x.code = x.categoryLedgerCode;
                x.name = x.categoryLedgerName;
                x.value = x.aggregatedRemainedAmount;
            });
        }
    }

    createPieChart() {
        this.zone.runOutsideAngular(() => {
            am4core.useTheme(am4themes_animated);
            this.chart = am4core.create('chartdiv', am4charts.PieChart);
            this.chart.data = this.data;
            this.pieSeries = this.chart.series.push(new am4charts.PieSeries());
            this.pieSeries.dataFields.value = 'value';
            this.pieSeries.dataFields.category = 'name';
            this.drillLevel.push(this.data);
            this.pieSeries.slices.template.events.on('hit', (event) => this.clickHandlerDeposit(event.target.dataItem), this);
            this.button = this.chart.chartContainer.createChild(am4core.Button);
            this.button.padding(5, 5, 5, 5);
            this.button.align = 'right';
            this.button.marginRight = 50;
            this.button.icon = new am4core.Sprite();
            this.button.icon.path = 'M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8';
            this.button.hidden = true;
            this.button.hide();
            this.button.events.on('hit', () => this.drillUpDeposit(), this);
        });
    }

    drillUpDeposit() {
        this.drillLevel.pop();
        this.chart.data = this.drillLevel[this.drillLevel.length - 1];
        if (this.drillLevel.length == 1) {
            this.button.hidden = true;
            this.button.hide();
        } else {
            this.button.hidden = false;
            this.button.appear();
        }
        this.pieSeries.appear();
    }

    clickHandlerDeposit(event) {
        this.callService(event);
    }

    updateChart(event, data) {
        if (data && data.length) {
            this.selectedSlice = event.slice;
            this.chart.data = data;
            this.drillLevel.push(data);
            this.button.hidden = false;
            this.button.appear();
            this.pieSeries.appear();
        }
    }

    callService(event) {
        if (event.dataContext.type === TreeOrderType.Category) {
            this.glService.getGroupByCategory(event.dataContext.code, this).subscribe((res: any) => {
                if (res) {
                    res.items.map((x) => {
                        x.type = TreeOrderType.Group;
                        x.code = x.groupLedgerCode;
                        x.name = x.groupLedgerName;
                        x.value = x.aggregatedRemainedAmount;
                    });
                    this.updateChart(event, res.items);
                }
            });
        } else if (event.dataContext.type === TreeOrderType.Group) {
            this.glService.getGeneralByGroup(event.dataContext.code, this).subscribe((res: any) => {
                if (res) {
                    res.items.map((x) => {
                        x.type = TreeOrderType.General;
                        x.code = x.generalLedgerCode;
                        x.name = x.generalLedgerName;
                        x.value = x.aggregatedRemainedAmount;
                    });
                    this.updateChart(event, res.items);
                }
            });
        } else if (event.dataContext.type === TreeOrderType.General) {
            this.glService.getSubsidiaryByGeneral(event.dataContext.code, this).subscribe((res: any) => {
                if (res) {
                    res.items.map((x) => {
                        x.type = TreeOrderType.Subsidiary;
                        x.code = x.subsidiaryLedgerCode;
                        x.name = x.subsidiaryLedgerName;
                        x.value = x.aggregatedRemainedAmount;
                    });
                    this.updateChart(event, res.items);
                }
            });
        } else if (event.dataContext.type === TreeOrderType.Subsidiary) {
            this.glService.getDetailBySubsidiary(event.dataContext.code, this).subscribe((res: any) => {
                if (res) {
                    res.items.map((x) => {
                        x.type = TreeOrderType.Detail;
                        x.code = x.detailLedgerCode;
                        x.name = x.detailLedgerName;
                        x.value = x.aggregatedRemainedAmount;
                    });
                    this.updateChart(event, res.items);
                }
            });
        }
    }

    ngAfterViewInit(): void {
        this.createPieChart();
    }

    handleError(): boolean {
        return false;
    }

    isWorking: any;
}
