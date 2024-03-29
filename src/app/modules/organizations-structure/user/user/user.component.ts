import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from '#shared/services/alert.service';
import { UserBatchComponent } from './user-batch/user-batch.component';
import { Organization, User } from '../user.model';
import { UserService } from '../user.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaginationModel } from '#shared/models/pagination.model';
import { Column, PaginationChangeType, TableSearchMode } from '#shared/components/table/table.model';
import * as _ from 'lodash';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit, OnDestroy {
    public organizations: Array<Organization> = [];
    public organizationsForm: FormGroup;
    public organizationsSearchControl: FormControl = new FormControl();

    public users: Array<User>;
    public columns: Array<Column> = [
        {
            id: 'firstname',
            name: 'نام',
            type: 'string',
            search: { type: 'text', mode: TableSearchMode.SERVER },
        },
        {
            id: 'lastname',
            name: 'نام خانوادگی',
            type: 'string',
            search: { type: 'text', mode: TableSearchMode.SERVER },
        },
        {
            id: 'email',
            name: 'رایانامه',
            type: 'string',
            search: { type: 'text', mode: TableSearchMode.SERVER },
        },
        {
            id: 'nationalCode',
            name: 'کد ملی',
            type: 'string',
            search: { type: 'text', mode: TableSearchMode.SERVER },
        },
        {
            id: 'phoneNumber',
            name: 'شماره‌ی همراه',
            type: 'string',
        },
        {
            id: 'status',
            name: 'وضعیت',
            type: 'string',
            convert: (value: 'Active' | 'InActive') => (value === 'Active' ? 'فعال' : 'غیر فعال'),
        },
        {
            name: 'عملیات',
            id: 'operation',
            type: 'operation',
            minWidth: '130px',
            sticky: true,
            operations: [
                { name: 'ویرایش', icon: 'create', color: 'primary', operation: ({ row }: any) => this.editUser(row) },
                { name: 'ویرایش وضعیت', icon: 'sync', color: 'warn', operation: ({ row }: any) => this.changeUserStatus(row) },
            ],
        },
    ];
    public usersSearchForm: FormGroup;
    public pagination: PaginationModel = { skip: 0, limit: 5, total: 100 };

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private userService: UserService, public matDialog: MatDialog, private alertService: AlertService, private formBuilder: FormBuilder) {}

    ngOnInit(): void {
        this.organizationsForm = this.formBuilder.group({ organization: [[], Validators.required] });
        this.getOrganizations();
        this.organizationsSearchInit();
        this.onOrganizationCodeChange();
        this.initSearch();
        this.getUsers([]);
    }

    public search(searchFilter: any): void {
        if (!searchFilter) {
            return;
        }
        Object.keys(searchFilter).forEach((key) => {
            this.usersSearchForm.controls[key].setValue(searchFilter[key]);
        });
        this.getUsers(this.usersSearchForm.value);
    }

    public paginationControl(pageEvent: PaginationChangeType): void {
        const organizationId: Array<string> = this.organizationsForm.controls['organization'].value;
        this.pagination.limit = pageEvent.limit;
        this.pagination.skip = pageEvent.skip;
        this.getUsers(organizationId);
    }

    public createUser(): void {
        const organizationIds: Array<string> = this.organizationsForm.controls['organization'].value;
        this.matDialog
            .open(UserBatchComponent, { data: null, panelClass: 'dialog-p-0' })
            .afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result: boolean) => result && this.getUsers(organizationIds));
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private organizationsSearchInit(): void {
        this.organizationsSearchControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value: string) => {
            this.getOrganizations(value);
        });
    }

    private getOrganizations(searchKeyword?: string): void {
        this.userService.getOrganizations(searchKeyword).subscribe((response) => (this.organizations = response.items));
    }

    private onOrganizationCodeChange(): void {
        this.organizationsForm.controls['organization'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value: Array<string>) => {
            if (value) {
                this.getUsers(value);
            }
        });
    }

    private initSearch(): void {
        const mapKeys = _.dropRight(_.map(this.columns, 'id'));
        const objectFromKeys = {};
        mapKeys.forEach((id) => (objectFromKeys[id] = ''));
        this.usersSearchForm = this.formBuilder.group({ ...objectFromKeys });
    }

    private getUsers(search?: any): void {
        this.userService.getUsers(this.pagination, search).subscribe((response) => {
            this.users = response.items;
            this.pagination.total = response.total;
        });
    }

    private editUser(user: User): void {
        const organizationIds: Array<string> = this.organizationsForm.controls['organization'].value;
        this.matDialog
            .open(UserBatchComponent, { data: user.id, panelClass: 'dialog-p-0' })
            .afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result: boolean) => result && this.getUsers(organizationIds));
    }

    private changeUserStatus(user: User): void {
        this.userService.changeUserStatus(user.id).subscribe(() => this.getUsers([]));
    }
}
