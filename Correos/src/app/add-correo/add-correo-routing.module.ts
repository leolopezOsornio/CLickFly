import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddCorreoPage } from './add-correo.page';

const routes: Routes = [
  {
    path: '',
    component: AddCorreoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddCorreoPageRoutingModule {}
