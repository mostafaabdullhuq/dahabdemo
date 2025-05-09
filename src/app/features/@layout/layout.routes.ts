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
import { CategoryComponent } from '../inventory/category/category.component';
import { AddEditCategoryComponent } from '../inventory/category/add-edit-category/add-edit-category.component';
import { AddEditStockPointComponent } from '../inventory/stock-point/add-edit-stock-point/add-edit-stock-point.component';
import { StockPointComponent } from '../inventory/stock-point/stock-point.component';
import { BrandsComponent } from '../inventory/brands/brands.component';
import { AddEditBrandComponent } from '../inventory/brands/add-edit-brand/add-edit-brand.component';
import { AddEditDesignerComponent } from '../inventory/designer/add-edit-designer/add-edit-designer.component';
import { DesignerComponent } from '../inventory/designer/designer.component';
import { StonesComponent } from '../inventory/stones/stones.component';
import { AddEditStoneComponent } from '../inventory/stones/add-edit-stone/add-edit-stone.component';
import { ColorsComponent } from '../inventory/colors/colors.component';
import { AddEditColorComponent } from '../inventory/colors/add-edit-color/add-edit-color.component';
import { StockTransferComponent } from '../inventory/stock-transfer/stock-transfer.component';
import { TransferListComponent } from '../inventory/stock-transfer/transfer-list/transfer-list.component';

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

      { path: 'categories', component: CategoryComponent },
      { path: 'category/add', component: AddEditCategoryComponent },
      { path: 'category/edit/:id', component: AddEditCategoryComponent },

      { path: 'stockpoints', component: StockPointComponent },
      { path: 'stockpoint/add', component: AddEditStockPointComponent },
      { path: 'stockpoint/edit/:id', component: AddEditStockPointComponent },

      { path: 'brands', component: BrandsComponent },
      { path: 'brand/add', component: AddEditBrandComponent },
      { path: 'brand/edit/:id', component: AddEditBrandComponent },

      { path: 'designers', component: DesignerComponent },
      { path: 'designer/add', component: AddEditDesignerComponent },
      { path: 'designer/edit/:id', component: AddEditDesignerComponent },

      { path: 'stones', component: StonesComponent },
      { path: 'stone/add', component: AddEditStoneComponent },
      { path: 'stone/edit/:id', component: AddEditStoneComponent },
      
      { path: 'colors', component: ColorsComponent },
      { path: 'color/add', component: AddEditColorComponent },
      { path: 'color/edit/:id', component: AddEditColorComponent },

      { path: 'stock-transfer-list', component: TransferListComponent },
      { path: 'stock-transfer', component: StockTransferComponent },
      { path: 'stock-transfer/edit/:id', component: StockTransferComponent },
    ]
  }
];
