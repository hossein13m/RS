import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '#shared/services/alert.service';
import { environment } from '#env/environment';

@Component({
    selector: 'app-cardboard-upload-dialog',
    templateUrl: './cardboard-upload-dialog.component.html',
    styleUrls: ['./cardboard-upload-dialog.component.scss'],
})
export class CardboardUploadDialogComponent implements OnInit {
    public form: FormGroup = this.fb.group({
        contract: [null, Validators.required],
        fileName: [null, Validators.required],
        description: [null],
        type: ['draft', Validators.required],
        file: [Validators.required],
    });
    private uploadedFile;

    constructor(
        public dialog: MatDialogRef<CardboardUploadDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData: { contractId: number; hasSignedFile: boolean },
        private readonly fb: FormBuilder,
        private readonly alertService: AlertService
    ) {}

    ngOnInit(): void {
        this.setUploadFormBase();
    }

    public uploadFiles(event: any) {
        this.uploadedFile = event.files[0];
        this.form.get('file').setValue(this.uploadedFile);
    }

    public submitForm(): void {
        const formData: FormData = new FormData();
        Object.keys(this.form.value).map((key) => formData.append(key, this.form.value[key]));
        if (!this.uploadedFile) {
            this.alertService.onError('فایل را آپلود کنید');
            return;
        } else {
            this.uploadFile(formData);
        }
    }

    public triggerFileSelect(): void {
        document.getElementById('uploadFile')?.click();
    }

    private setUploadFormBase(): void {
        this.form.get('contract').setValue(this.dialogData.contractId);
        this.dialogData.hasSignedFile ? this.form.get('description').setValidators([Validators.required]) : this.form.get('description').setValidators([]);
        this.form.updateValueAndValidity();
    }

    private uploadFile(formData: any): void {
        const xhr = new XMLHttpRequest();
        const envUrl = environment.serviceUrl;
        xhr.open('POST', `${envUrl}/api/v1/contract-file/upload`);
        const token = localStorage.getItem('accessToken');
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.send(formData);
        xhr.addEventListener('load', () => {
            this.alertService.onSuccess('با موفقیت آپلود شد');
            this.dialog.close(true);
        });
        xhr.addEventListener('error', () => this.alertService.onError('مشکلی پیش آمده‌است'));
    }
}
