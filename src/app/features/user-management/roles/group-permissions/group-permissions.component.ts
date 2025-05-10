import { UserManagmentService } from './../../@services/user-managment.service';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { ActivatedRoute } from '@angular/router';
interface PermissionGroup {
  entity: string;
  actions: {
    [action: string]: number; // maps action name to ID
  };
}
@Component({
  selector: 'app-group-permissions',
  imports: [SharedModule],
  templateUrl: './group-permissions.component.html',
  styleUrl: './group-permissions.component.scss'
})
export class GroupPermissionsComponent implements OnChanges ,OnInit{
  @Input() permissions: { id: number; name: string }[] = [];
  groupedPermissions: { entity: string; actions: { [key: string]: number } }[] = [];
  selectedPermissions = new Set<number>(); // Store selected IDs
  isEditMode:boolean =false;
  form: FormGroup;
  roleId: string | number = '';

  constructor(private fb: FormBuilder, private _userManagmentService:UserManagmentService,private _activeRoute: ActivatedRoute) {
    this.form = this.fb.group({
      role_name: ['']
    });
  }
  ngOnInit(): void {
    const roleId = this._activeRoute.snapshot.paramMap.get('id');
    if (roleId) {
      this.roleId = roleId;
      this.isEditMode = true;
      this.loadRoleData(this.roleId);
    }
  }

  ngOnChanges(): void {
    if (this.permissions.length) {
      this.groupPermissions();
    }
  }

  groupPermissions(): void {
    const groups: { [key: string]: { [key: string]: number } } = {};

    for (const perm of this.permissions) {
      const parts = perm.name.split('.');
      if (parts.length !== 3) continue;

      const [module, entity, rawAction] = parts;
      const key = `${module}.${entity}`;

      let action: string | null = null;
      if (['add', 'create'].includes(rawAction)) action = 'add';
      else if (['edit', 'update'].includes(rawAction)) action = 'edit';
      else if (rawAction === 'view') action = 'view';
      else if (rawAction === 'delete') action = 'delete';

      if (!action) continue;

      if (!groups[key]) groups[key] = {};
      groups[key][action] = perm.id;
    }

    this.groupedPermissions = Object.entries(groups).map(([entity, actions]) => ({
      entity,
      actions
    }));
  }

  togglePermission(id: number): void {
    if (this.selectedPermissions.has(id)) {
      this.selectedPermissions.delete(id);
    } else {
      this.selectedPermissions.add(id);
    }
  }
  private loadRoleData(roleId: string | number): void {
    this._userManagmentService.getRoleById(roleId).subscribe((role: any) => {
      // Assuming this.permissions contains the list of all permissions with their ids
      const permissionIds = this.permissions
        .filter(permission => role.permissions.includes(permission.name))
        .map(permission => permission.id); // Map names to ids
      
      console.log(permissionIds);
      
      // Patching the form with the response data
      this.form.patchValue({
        role_name: role.name, // Patch role_name with 'name' from the API response
        permissions: permissionIds // Patch permissions with the corresponding ids
      });
      
      // Update selectedPermissions with the ids directly (this ensures correct initial state)
      this.selectedPermissions = new Set(permissionIds);
    });
  }
  
  
  submit(): void {
    const payload = {
      role_name: this.form.value.role_name,
      role_permissions: Array.from(this.selectedPermissions)
    };
    console.log(payload);
    
    // this._userManagmentService.addRole(this.form).subscribe(res=>{
      
    // })
  }
  onSubmit(): void {
    if (this.form.invalid) return;

    const payload:any = {
      role_name: this.form.value.role_name,
      role_permissions: Array.from(this.selectedPermissions)
    };

    if (this.isEditMode && this.roleId) {
      this._userManagmentService.updateRole(this.roleId, payload).subscribe({
        next: res => console.log('Role updated successfully', res),
        error: err => console.error('Error updating role', err)
      });
    } else {
      this._userManagmentService.addRole(payload).subscribe({
        next: res => console.log('Role created successfully', res),
        error: err => console.error('Error creating role', err)
      });
    }
  }
}