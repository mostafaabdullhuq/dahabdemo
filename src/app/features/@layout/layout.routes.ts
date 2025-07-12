import { ChartOfAccComponent } from './../accounting/chart-of-acc/chart-of-acc.component';
import { TaxRateComponent } from './../settings/tax-rate/tax-rate.component';
import { PurchasesComponent } from './../accounting/purchases/purchases.component';
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
import { CustomersComponent } from '../contact/customers/customers.component';
import { AddEditCustomerComponent } from '../contact/customers/add-edit-customer/add-edit-customer.component';
import {
  AddEditCustomerGroupComponent
} from '../contact/customers/customer-group/add-edit-customer-group/add-edit-customer-group.component';
import { CustomerGroupComponent } from '../contact/customers/customer-group/customer-group.component';
import { SuppliersComponent } from '../contact/suppliers/suppliers.component';
import { AddEditSupplierComponent } from '../contact/suppliers/add-edit-supplier/add-edit-supplier.component';
import { CustomerViewComponent } from '../contact/customers/customer-view/customer-view.component';
import { SupplierViewComponent } from '../contact/suppliers/supplier-view/supplier-view.component';
import { TransactionsComponent } from '../accounting/transactions/transactions.component';
import { AddEditPurchaseComponent } from '../accounting/purchases/add-edit-purchase/add-edit-purchase.component';
import { ExpensesComponent } from '../accounting/expenses/expenses.component';
import { AddEditExpensesComponent } from '../accounting/expenses/add-edit-expenses/add-edit-expenses.component';
import {
  AddEditExpenseCatComponent
} from '../accounting/expenses/expenses-category/add-edit-expense-cat/add-edit-expense-cat.component';
import { ExpensesCategoryComponent } from '../accounting/expenses/expenses-category/expenses-category.component';
import { BusinessComponent } from '../settings/business/business.component';
import { BranchesComponent } from '../settings/branches/branches.component';
import { AddEditBranchComponent } from '../settings/branches/add-edit-branch/add-edit-branch.component';
import { AddEditTaxComponent } from '../settings/tax-rate/add-edit-tax/add-edit-tax.component';
import { PaymentOptionsComponent } from '../settings/payment-options/payment-options.component';
import {
  AddEditPaymentOptionsComponent
} from '../settings/payment-options/add-edit-payment-options/add-edit-payment-options.component';
import { CurrenciesComponent } from '../settings/currencies/currencies.component';
import { AddEditCurrencyComponent } from '../settings/currencies/add-edit-currency/add-edit-currency.component';
import { InvoiceComponent } from '../settings/invoice/invoice.component';
import { AddEditInvoiceComponent } from '../settings/invoice/add-edit-invoice/add-edit-invoice.component';
import { AccountingTabsComponent } from '../accounting/accounting-tabs/accounting-tabs.component';
import { JournalEntryComponent } from '../accounting/journal-entry/journal-entry.component';
import {
  AddEditJournalEntryComponent
} from '../accounting/journal-entry/add-edit-journal-entry/add-edit-journal-entry.component';
import { UserDashboardComponent } from '../user-dashboard/user-dashboard.component';
import { ProductLabelsComponent } from '../inventory/product-labels/product-labels.component';
import { ViewAccLedgerComponent } from '../accounting/view-acc-ledger/view-acc-ledger.component';
import {
  AddEditTransactionComponent
} from '../accounting/transactions/add-edit-transaction/add-edit-transaction.component';
import {
  DeletedTransactionsComponent
} from '../accounting/transactions/deleted-transactions/deleted-transactions.component';
import { AccReportsComponent } from '../accounting/acc-reports/acc-reports.component';
import { CountDownComponent } from '../inventory/count-down/count-down.component';
import { SalesReportsComponent } from '../accounting/acc-reports/sales/sales-reports.component';
import { ExpensesReportsComponent } from '../accounting/acc-reports/expenses/expenses-reports.component';
import { StockReportsComponent } from '../accounting/acc-reports/stocks/stock-reports.component';
import { LiabilitiesReportsComponent } from '../accounting/acc-reports/liabilities/liabilities-reports.component';
import { AssetsReportsComponent } from '../accounting/acc-reports/assets/assets-reports.component';
import { VatsReportsComponent } from '../accounting/acc-reports/vats/vats-reports.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: UserDashboardComponent },
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
  // Inventory
  {
    path: 'inventory', children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: ProductListComponent },
      { path: 'product/add', component: AddEditProductComponent },
      { path: 'product/edit/:id', component: AddEditProductComponent },
      { path: 'product/product-label', component: ProductLabelsComponent },

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

      { path: 'stock-taking', component: CountDownComponent },
    ]
  },
  // Contacts
  {
    path: 'contact', children: [
      { path: '', redirectTo: 'customers', pathMatch: 'full' },
      { path: 'customers', component: CustomersComponent },
      { path: 'customer/add', component: AddEditCustomerComponent },
      { path: 'customer/edit/:id', component: AddEditCustomerComponent },
      { path: 'customer-view/:id', component: CustomerViewComponent },

      { path: 'customers-group', component: CustomerGroupComponent },
      { path: 'customers-group/add', component: AddEditCustomerGroupComponent },
      { path: 'customers-group/edit/:id', component: AddEditCustomerGroupComponent },

      { path: 'suppliers', component: SuppliersComponent },
      { path: 'supplier/add', component: AddEditSupplierComponent },
      { path: 'supplier/edit/:id', component: AddEditSupplierComponent },
      { path: 'supplier-view/:id', component: SupplierViewComponent },
    ]
  },
  // Accounting
  {
    path: 'acc', children: [
      { path: '', redirectTo: 'transactions', pathMatch: 'full' },
      { path: 'transactions', component: TransactionsComponent },
      { path: 'deleted-transactions', component: DeletedTransactionsComponent },
      { path: 'transaction/edit/:id', component: AddEditTransactionComponent },
      // { path: 'customer/add', component: AddEditCustomerComponent },
      // { path: 'customer-view/:id', component: CustomerViewComponent }

      { path: '', redirectTo: 'purchases', pathMatch: 'full' },
      { path: 'purchases', component: PurchasesComponent },
      { path: 'purchase/add', component: AddEditPurchaseComponent },
      { path: 'purchase/edit/:id', component: AddEditPurchaseComponent },

      { path: '', redirectTo: 'expenses', pathMatch: 'full' },
      { path: 'expenses', component: ExpensesComponent },
      { path: 'expense/add', component: AddEditExpensesComponent },
      { path: 'expense/edit/:id', component: AddEditExpensesComponent },

      { path: '', redirectTo: 'expenses-cat', pathMatch: 'full' },
      { path: 'expenses-cat', component: ExpensesCategoryComponent },
      { path: 'expenses-cat/add', component: AddEditExpenseCatComponent },
      { path: 'expenses-cat/edit/:id', component: AddEditExpenseCatComponent },

      { path: 'accounting', component: AccountingTabsComponent },
      { path: 'ledger-view/:id', component: ViewAccLedgerComponent },
      { path: 'chart-of-acc', component: ChartOfAccComponent },
      { path: 'journal-entry', component: JournalEntryComponent },
      { path: 'journal-entry/add', component: AddEditJournalEntryComponent },
      { path: 'journal-entry/edit/:id', component: AddEditJournalEntryComponent },
      {
        path: 'acc-reports',
        // reports
        children: [
          { path: '', component: AccReportsComponent, pathMatch: 'full' },
          { path: 'sales', component: SalesReportsComponent },
          { path: 'expenses', component: ExpensesReportsComponent },
          { path: 'stocks', component: StockReportsComponent },
          { path: 'liabilities', component: LiabilitiesReportsComponent },
          { path: 'assets', component: AssetsReportsComponent },
          { path: 'vats', component: VatsReportsComponent },

        ]
      },
    ]
  },
  // settings
  {
    path: 'setting', children: [
      { path: '', redirectTo: 'business', pathMatch: 'full' },
      { path: 'business', component: BusinessComponent },
      // { path: 'customer/add', component: AddEditCustomerComponent },
      // { path: 'customer/edit/:id', component: AddEditCustomerComponent },
      // { path: 'customer-view/:id', component: CustomerViewComponent }

      { path: '', redirectTo: 'branch', pathMatch: 'full' },
      { path: 'branch', component: BranchesComponent },
      { path: 'branch/add', component: AddEditBranchComponent },
      { path: 'branch/edit/:id', component: AddEditBranchComponent },

      { path: '', redirectTo: 'tax-rate', pathMatch: 'full' },
      { path: 'tax-rate', component: TaxRateComponent },
      { path: 'tax-rate/add', component: AddEditTaxComponent },
      { path: 'tax-rate/edit/:id', component: AddEditTaxComponent },

      { path: '', redirectTo: 'payment-options', pathMatch: 'full' },
      { path: 'payment-options', component: PaymentOptionsComponent },
      { path: 'payment-option/add', component: AddEditPaymentOptionsComponent },
      { path: 'payment-option/edit/:id', component: AddEditPaymentOptionsComponent },

      { path: '', redirectTo: 'currencies', pathMatch: 'full' },
      { path: 'currencies', component: CurrenciesComponent },
      { path: 'currency/add', component: AddEditCurrencyComponent },
      { path: 'currency/edit/:id', component: AddEditCurrencyComponent },

      { path: '', redirectTo: 'invoice', pathMatch: 'full' },
      { path: 'invoice', component: InvoiceComponent },
      { path: 'invoice/add', component: AddEditInvoiceComponent },
      { path: 'invoice/edit/:id', component: AddEditInvoiceComponent },
    ]
  }
];
