import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vertical-layout-1',
    templateUrl: './layout-1.component.html',
    styleUrls: ['./layout-1.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class VerticalLayout1Component implements OnInit, OnDestroy {
    fuseConfig: any;
    private _unsubscribeAll: Subject<any>;

    constructor(private _fuseConfigService: FuseConfigService) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this._fuseConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe((config) => (this.fuseConfig = config));
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
