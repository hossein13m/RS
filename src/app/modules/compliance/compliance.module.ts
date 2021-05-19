import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ShareModule } from 'app/shared/share.module';
import { CalculatedComplianceComponent } from './calculated-compliance/calculated-compliance.component';
import { ComplianceFundComponent } from './compliance-fund/compliance-fund.component';
import { ComplianceRoutingModule } from './compliance-routing.module';
import { CompliancesComponent } from './compliances/compliances.component';
import { CompliancesService } from './compliances.service';

@NgModule({
    declarations: [CompliancesComponent, ComplianceFundComponent, CalculatedComplianceComponent],
    imports: [CommonModule, ComplianceRoutingModule, ShareModule],
    entryComponents: [ComplianceFundComponent],
    providers: [CompliancesService],
})
export class ComplianceModule {}
