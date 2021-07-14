import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: `contract-list`, loadChildren: () => import('./contract-list/contract-list.module').then((m) => m.ContractListModule) },
    { path: `contract-type`, loadChildren: () => import('./contract-type/contract-type.module').then((m) => m.ContractTypeModule) },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ContractRoutingModule {}
