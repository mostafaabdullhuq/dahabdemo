import { Component, OnInit } from '@angular/core';
import { GroupPermissionsComponent } from '../group-permissions/group-permissions.component';
import { UserManagmentService } from '../../@services/user-managment.service';

@Component({
  selector: 'app-add-edit-roles',
  imports: [GroupPermissionsComponent],
  templateUrl: './add-edit-roles.component.html',
  styleUrl: './add-edit-roles.component.scss'
})
export class AddEditRolesComponent implements OnInit {
  constructor(private _userManageService:UserManagmentService){}
  permissionList:any = [];

  ngOnInit(): void {
    this._userManageService.getRolesPermissions().subscribe(res => {
      this.permissionList = res
    })
  }

}
