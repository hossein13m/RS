import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { FindFlowInstanceResponseDto } from 'app/services/API/models';
import { FlowsInstanceService } from 'app/services/App/flow/flow-instance.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AddFlowInstanceComponent } from './add-flow-instance/add-flow-instance.component';
import { ColumnModel, TableSearchMode } from '#shared/components/table/table.model';

@Component({
    selector: 'app-flow-instance',
    templateUrl: './flow-instance.component.html',
    styleUrls: ['./flow-instance.component.scss'],
    animations: fuseAnimations,
})
export class FlowInstanceComponent implements OnInit {
    public flowInstancesList: FindFlowInstanceResponseDto[] = [];
    public ELEMENT_DATA: FindFlowInstanceResponseDto[] = [];
    public SearchInput: FormGroup;
    column: Array<ColumnModel>;
    dialogRef: any;
    loading = false;
    dataSource = new Array<any>(this.ELEMENT_DATA);
    displayedColumns = ['code', 'title', 'customerName', 'flowName', 'date', 'state', 'more'];

    constructor(private flowsInstanceService: FlowsInstanceService, private _matDialog: MatDialog, private fb: FormBuilder) {}

    ngOnInit(): void {
        this.createForm();
        this.get();
    }

    initColumns(): void {
        this.column = [
            {
                id: 'code',
                name: 'کد قرارداد',
                type: 'string',
                search: {
                    mode: TableSearchMode.SERVER,
                    type: 'text',
                },
            },
            {
                id: 'title',
                name: 'عنوان قرارداد',
                type: 'string',
                search: {
                    mode: TableSearchMode.SERVER,
                    type: 'text',
                },
            },
            {
                id: 'customerName',
                name: 'طرف قرارداد',
                type: 'string',
                search: {
                    mode: TableSearchMode.SERVER,
                    type: 'text',
                },
            },
            {
                id: 'flowId',
                name: 'الگو قرارداد',
                type: 'string',
                search: {
                    mode: TableSearchMode.SERVER,
                    type: 'text',
                },
                convert: (value) => value?.name,
            },
            {
                id: 'date',
                name: 'تاریخ ثبت اولیه',
                type: 'date',
            },
            {
                id: 'state',
                name: 'وضعیت',
                type: 'string',
            }
        ];
    }

    get(): void {
        this.flowsInstanceService.flowInstances.subscribe((res) => {
            this.flowInstancesList = res;
            this.ELEMENT_DATA = res;
            this.dataSource = new Array<any>(this.ELEMENT_DATA);
        });
        this.flowsInstanceService.getFlowInstances().subscribe();
    }

    search(searchFilter: any): void {
        if (!searchFilter) {
            return;
        }

        Object.keys(searchFilter).forEach((key) => {
            this.SearchInput.controls[key].setValue(searchFilter[key]);
        });

        this.flowsInstanceService.specificationModel.searchKeyword = searchFilter;
        this.flowsInstanceService.specificationModel.skip = 0;
        this.get();
    }

    createForm(): void {
        this.SearchInput = this.fb.group({
            code: [],
            title: [],
            customerName: [],
            flowName: [],
        });
    }

    addFlowInstance(): void {
        this.dialogRef = this._matDialog.open(AddFlowInstanceComponent, {
            panelClass: 'dialog-p-0',
            data: {
                action: 'new',
            },
        });

        this.dialogRef.afterClosed().subscribe((response) => {});
    }

    editFlowInstance(flowInstance): void {
        this._matDialog.open(AddFlowInstanceComponent, {
            panelClass: 'dialog-p-0',
            data: {
                flowInstance: flowInstance,
                action: 'edit',
            },
        });
    }
}
