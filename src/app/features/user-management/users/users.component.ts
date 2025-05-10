import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserManagmentService } from '../@services/user-managment.service';
import { SharedModule } from '../../../shared/shared.module';
import { Router, RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';

@Component({
  selector: 'app-users',
  imports: [ SharedModule, RouterLink],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  users: any[] = [];
  cols: any[] = [];
  filterForm!: FormGroup;
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;

  constructor(
    private _userManage: UserManagmentService,
    private _formBuilder: FormBuilder,
    private _router:Router,
    private _confirmPopUp:ConfirmationPopUpService
  ) { }

  ngOnInit(): void {
    this.cols = [
      { field: 'username', header: 'User Name' },
      { field: 'email', header: 'Email' },
      { field: 'phone_number', header: 'Phone No.' },
      { field: 'address', header: 'Address' },
      { field: 'role_name', header: 'Role Name' }
    ];
    this.filterForm = this._formBuilder.group({
      username: '',
      search: '',
      phone_number:'',
      isActive:null,
      email:'',
    });
    this.getUsers();
  }

  // Get users with filtering and pagination
  getUsers(page: number = 1, pageSize: number = 10): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';

    // Correct pagination parameters and make API call
    this._userManage.getUsers(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
      this.users = res?.results;
      this.totalRecords = res?.count;  // Ensure the total count is updated
    });
  }
loadUsers(event: any): void {
  const page = event.first / event.rows + 1;
  const pageSize = event.rows;

  this.first = event.first;
  this.pageSize = pageSize;

  this._userManage.getUsers(this.filterForm?.value?.search || '',page,pageSize)
    .subscribe((res) => {
      this.users = res.results;
      this.totalRecords = res.count;
    });
}
selectedProduct: any;

productMenuItems: MenuItem[] = [
  {
    label: 'Edit',
    icon: 'pi pi-fw pi-pen-to-square',
    command: () => this.editUser(this.selectedProduct)
  },
  {
    label: 'Delete',
    icon: 'pi pi-fw pi-trash',
    command: () => this.showConfirmDelete(this.selectedProduct)
  }
  
];

editUser(user: any) {
  this._router.navigate([`user-management/users/edit/${user?.id}`]);
}
deleteUser(user:any){
  this._userManage.deleteUser(user?.id).subscribe(res=>{
    if(res){
      this.getUsers()
    }
  })
}
showConfirmDelete(user: any) {
  console.log(user);
  
  this._confirmPopUp.confirm({
    message: 'Do you want to delete this item?',
    header: 'Confirm Delete',
    onAccept: () => {
      this.deleteUser(user);
    },
    target:user
  });
}
}