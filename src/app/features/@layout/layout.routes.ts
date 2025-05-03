import { Routes } from '@angular/router';
import { UsersComponent } from '../user-management/users/users.component';
import { AddEditUserComponent } from '../user-management/users/add-edit-user/add-edit-user.component';
import { RolesComponent } from '../user-management/roles/roles.component';
import { AddEditRolesComponent } from '../user-management/roles/add-edit-roles/add-edit-roles.component';
import { ProductListComponent } from '../inventory/product-list/product-list.component';
import { AddEditProductComponent } from '../inventory/product-list/add-edit-product/add-edit-product.component';

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
    ]
  }
];
