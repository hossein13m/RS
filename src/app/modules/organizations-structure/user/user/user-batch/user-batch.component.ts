import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateUser, Organization, Roles, Units } from '../../user.model';
import { UserService } from '../../user.service';
import { Subject } from 'rxjs';
import { first, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { matchValidator } from '#shared/validators/match/match.validator';
import { phoneNumberValidator } from '#shared/validators/phoneNumber/phoneNumberValidator';
import * as _ from 'lodash';
import { AlertService } from '../../../../../services/alert.service';

@Component({
    selector: 'app-user-batch',
    templateUrl: './user-batch.component.html',
    styleUrls: ['./user-batch.component.scss'],
})
export class UserBatchComponent implements OnInit, OnDestroy {
    data: CreateUser = null;
    public title: string;

    public form: FormGroup;

    public get userRoles(): FormArray {
        return this.form.get('userRoles') as FormArray;
    }

    public userRoleControlsData: Array<{
        organizations: Array<Organization>;
        units: Units;
        roles: Roles;
    }> = [];

    private defaultOrganizations: Array<Organization> = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public dialogRef: MatDialogRef<UserBatchComponent>,
        private formBuilder: FormBuilder,
        private userService: UserService,
        private alertService: AlertService
    ) {}

    ngOnInit(): void {
        this.formInit();
        this.defaultOrganizationsInit();
        this.passwordChange();
    }

    private formInit(): void {
        this.form = this.formBuilder.group({
            username: [this.data?.username ?? '', Validators.required],
            password: [this.data?.password ?? '', [Validators.required, Validators.minLength(7)]],
            confirmPassword: [this.data?.confirmPassword ?? '', [Validators.required, Validators.minLength(7)]],
            firstname: [this.data?.firstname ?? '', Validators.required],
            lastname: [this.data?.lastname ?? '', Validators.required],
            nationalCode: [this.data?.nationalCode ?? '', [Validators.required, Validators.minLength(10)]],
            phoneNumber: [this.data?.phoneNumber ?? '', [Validators.required, phoneNumberValidator()]],
            email: [this.data?.email ?? '', [Validators.required, Validators.email]],
            birthDate: [this.data?.birthDate ?? '', Validators.required],
            // Todo: userRoles initialValue on put
            userRoles: this.formBuilder.array([], [Validators.required]),
        });
    }

    public addRole(): void {
        const roleForm = this.formBuilder.group({
            personnelCode: ['', Validators.required],
            organizationId: ['', Validators.required],
            organizationCode: ['', Validators.required],
            units: [[], Validators.required],
            roles: [[], Validators.required],
        });

        this.userRoleControlsData.push({
            organizations: this.defaultOrganizations,
            units: null,
            roles: null,
        });

        this.userRoles.push(roleForm);

        this.onOrganizationCodeChange(this.userRoleControlsData.length - 1);
    }

    public deleteRole(index: number): void {
        this.userRoleControlsData.splice(index, 1);
        this.userRoles.removeAt(index);
    }

    private onOrganizationCodeChange(index): void {
        const { controls } = this.form.get('userRoles') as FormArray;
        const addedForm = controls[index] as FormGroup;

        addedForm.controls['organizationCode'].valueChanges
            .pipe(
                tap((organizationCode: number) => {
                    addedForm.controls['organizationId'].setValue(getOrganizationsId(organizationCode, this.defaultOrganizations));
                }),
                takeUntil(this._unsubscribeAll),
                mergeMap((organizationCode: number) => this.userService.getOrganizationUnits([organizationCode]))
            )
            .subscribe((response) => {
                resetControls();
                this.userRoleControlsData[index].units = response;
                this.onUnitsChange(index);
            });

        function getOrganizationsId(organizationCode: number, organizations: Array<Organization>): number {
            const { id } = _.find(organizations, (organization) => organization.code === organizationCode);
            return id;
        }

        function resetControls(): void {
            addedForm.controls['units'].reset([]);
            addedForm.controls['roles'].reset([]);
        }
    }

    private onUnitsChange(index): void {
        const { controls } = this.form.get('userRoles') as FormArray;
        const addedForm = controls[index] as FormGroup;
        const { organizationCode } = addedForm.value;

        addedForm.controls['units'].valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                mergeMap((units: Array<number>) => this.userService.getOrganizationRoles(organizationCode, units))
            )
            .subscribe((response) => {
                resetRoleControl();
                this.userRoleControlsData[index].roles = response;
            });

        function resetRoleControl(): void {
            addedForm.controls['roles'].reset([]);
        }
    }

    public onSubmit(): void {
        if (this.form.invalid) {
            this.alertService.onError('لطفا ورودی های خود را چک کنید.');
            return;
        }

        this.userService.createUser(this.form.value).subscribe(() => {
            this.alertService.onSuccess('کاربر با موفقیت ساخته شد.');
        });
    }

    private defaultOrganizationsInit(): void {
        this.userService
            .getOrganizations()
            .pipe(first())
            .subscribe((response) => {
                this.defaultOrganizations = response.items;
                this.addRole();
            });
    }

    private passwordChange(): void {
        const passwordControl = this.form.controls['password'];
        const confirmPasswordControl = this.form.controls['confirmPassword'];

        passwordControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value: string) => {
            confirmPasswordControl.setValidators([Validators.required, Validators.minLength(7), matchValidator(value)]);
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
