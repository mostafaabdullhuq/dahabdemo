import { Routes } from '@angular/router';
import { UsersComponent } from '../user-management/users/users.component';
import { AddEditUserComponent } from '../user-management/users/add-edit-user/add-edit-user.component';
import { RolesComponent } from '../user-management/roles/roles.component';
import { AddEditRolesComponent } from '../user-management/roles/add-edit-roles/add-edit-roles.component';
import { ProductListComponent } from '../inventory/product-list/product-list.component';
import { AddEditProductComponent } from '../inventory/product-list/add-edit-product/add-edit-product.component';
import { UnitsComponent } from '../inventory/units/units.component';
import { AddEditUnitComponent } from '../inventory/units/add-edit-unit/add-edit-unit.component';
import { AddEditPurityComponent } from '../inventory/purity/add-edit-purity/add-edit-purity.component';
import { PurityComponent } from '../inventory/purity/purity.component';
import { SizesComponent } from '../inventory/sizes/sizes.component';
import { AddEditSizeComponent } from '../inventory/sizes/add-edit-size/add-edit-size.component';

export const routes: Routes = [
  // User Management
  {
    path: 'user-management', children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UsersComponent },
      { path: 'users/add', component: AddEditUserComponent },
      { path: 'users/edit/:id', component: AddEditUserComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'roles/add', component: AddEditRolesComponent },
      { path: 'roles/edit/:id', component: AddEditRolesComponent },
    ]
  },
  {
    path: 'inventory', children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: ProductListComponent },
      { path: 'product/add', component: AddEditProductComponent },
      { path: 'product/edit/:id', component: AddEditProductComponent },

      { path: 'units', component: UnitsComponent },
      { path: 'unit/add', component: AddEditUnitComponent },
      { path: 'unit/edit/:id', component: AddEditUnitComponent },

      { path: 'purities', component: PurityComponent },
      { path: 'purity/add', component: AddEditPurityComponent },
      { path: 'purity/edit/:id', component: AddEditPurityComponent },

      { path: 'sizes', component: SizesComponent },
      { path: 'size/add', component: AddEditSizeComponent },
      { path: 'size/edit/:id', component: AddEditSizeComponent },
    ]
  }
];
