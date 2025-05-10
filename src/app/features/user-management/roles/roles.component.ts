import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserManagmentService } from '../@services/user-managment.service';
import { Router, RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-roles',
  imports: [SharedModule, RouterLink],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent {
    roles: any[] = [];
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
        { field: 'id', header: 'ID' },
        { field: 'name', header: 'Name' },
      ];
      this.filterForm = this._formBuilder.group({
        username: '',
        search: '',
        phone_number:'',
        isActive:null,
        email:'',
      });
      this.getRoles();
    }
  
    // Get roles with filtering and pagination
    getRoles(page: number = 1, pageSize: number = 10): void {
      //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
  
      // Correct pagination parameters and make API call
      this._userManage.getRoles('', page, pageSize).subscribe(res => {
        this.roles = res?.results;
        this.totalRecords = res?.count;  // Ensure the total count is updated
      });
    }
    loadRoles(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;
  
    this.first = event.first;
    this.pageSize = pageSize;
  
    this._userManage.getRoles('',page,pageSize)
      .subscribe((res) => {
        this.roles = res.results;
        this.totalRecords = res.count;
      });
  }
  selectedProduct: any;
  
  productMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editRole(this.selectedProduct)
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.showConfirmDelete(this.selectedProduct)
    }
    
  ];
  
  editRole(role: any) {
    this._router.navigate([`user-management/roles/edit/${role?.id}`]);
  }
  deleteRole(role:any){
    this._userManage.deleteRole(role?.id).subscribe(res=>{
      if(res){
        this.getRoles()
      }
    })
  }
  showConfirmDelete(role: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteRole(role);
      },
      target: role?.id
    });
  }
  }
