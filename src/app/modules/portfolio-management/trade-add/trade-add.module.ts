import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LayoutModule } from 'app/layout/layout.module';
import { ShareModule } from 'app/shared/share.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { TradeAddRoutingModule } from './trade-add-routing.module';
import { TradeAddComponent } from './trade-add.component';
import { TradeAddService } from './trade-add.service';
import { HeaderModule } from '../../../layout/components/header/header.module';

@NgModule({
    declarations: [TradeAddComponent],
    imports: [CommonModule, TradeAddRoutingModule, LayoutModule, ShareModule, NgxMatSelectSearchModule, HeaderModule],
    providers: [TradeAddService],
})
export class TradeAddModule {}
