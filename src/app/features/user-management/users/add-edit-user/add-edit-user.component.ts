import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserManagmentService } from '../../@services/user-managment.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-edit-user',
  imports: [SharedModule],
  templateUrl: './add-edit-user.component.html',
  styleUrl: './add-edit-user.component.scss'
})
export class AddEditUserComponent implements OnInit {
  addEditUserForm!: FormGroup;
  isEditMode = false;
  userId: string | number = '';
  branches: any[] = [];
  roles: any[] = [];

  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];

  constructor(
    private _userManage: UserManagmentService,
    private _formBuilder: FormBuilder,
    private _dropdownService: DropdownsService,
    private _activeRoute: ActivatedRoute,
    private _router: Router
  ) { }

  ngOnInit(): void {
    const userId = this._activeRoute.snapshot.paramMap.get('id');
    if (userId)
      this.userId = userId;
    this.initForm();
    if (this.userId) {
      this.loadUserData(this.userId);
      this.isEditMode = true
    }

    this._dropdownService.getBranches().subscribe(data => {
      this.branches = data?.results;
    });
    this._dropdownService.getRoles().subscribe(data => {
      this.roles = data?.results;
    });
  }

  private initForm(): void {
    this.addEditUserForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: [''],
      phone_number: [''],
      address: [''],
      role: ['', [Validators.required]],
      branches: new FormControl<any[] | null>([])
    });

    let branchesControl = this.addEditUserForm.get("branches");

    this.addEditUserForm.get('role')?.valueChanges.subscribe(roleId => {

      if (roleId === 1) {
        branchesControl?.disable();
        branchesControl?.clearAsyncValidators();
      } else {
        branchesControl?.enable();
        branchesControl?.setValidators(Validators.required)
      }

      branchesControl?.updateValueAndValidity();
    })
  }

  private loadUserData(userId: number | string): void {
    this._userManage.getUserById(userId).subscribe((user: any) => {
      this.addEditUserForm.patchValue({
        email: user.email,
        username: user.username,
        password: '',
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
        branches: user.branches_id
      });
    });
  }

  onSubmit(): void {
    if (this.addEditUserForm.invalid) return;

    const formData = this.addEditUserForm?.value;

    if (this.isEditMode && this.userId) {
      this._userManage.updateUser(this.userId, formData).subscribe({
        next: res => this._router.navigate([`user-management/users`]),
        error: err => console.error('Error updating user', err)
      });
    } else {
      this._userManage.addUser(formData).subscribe({
        next: res => this._router.navigate([`user-management/users`]),
        error: err => console.error('Error creating user', err)
      });
    }
  }
}
