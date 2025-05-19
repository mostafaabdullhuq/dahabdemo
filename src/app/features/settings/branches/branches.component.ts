import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../@services/settings.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { SharedModule } from '../../../shared/shared.module';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-branches',
  imports: [SharedModule, RouterLink],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.scss'
})
export class BranchesComponent {
    Branches: any[] = [];
    cols: any[] = [];
    filterForm!: FormGroup;
    totalRecords: number = 0;
    pageSize: number = 10;
    first: number = 0;
  
    constructor(
      private _sttingService: SettingsService,
      private _formBuilder: FormBuilder,
      private _router:Router,
      private _confirmPopUp:ConfirmationPopUpService
    ) { }
  
    ngOnInit(): void {
      this.cols = [
        { field: 'name', header: 'Brand Name' },
      ];
      this.filterForm = this._formBuilder.group({
        search: '',
      });
      this.getBranches();
    }
  
    // Get Branches with filtering and pagination
    getBranches( search:any='',page: number = 1, pageSize: number = 10): void {
      //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
  
      // Correct pagination parameters and make API call
      this._sttingService.getBranches(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
        this.Branches = res?.results;
        this.totalRecords = res?.count;  // Ensure the total count is updated
      });
    }
  loadBranches(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;
  
    this.first = event.first;
    this.pageSize = pageSize;
  
    this._sttingService.getBranches(this.filterForm?.value?.search || '',page,pageSize)
      .subscribe((res) => {
        this.Branches = res.results;
        this.totalRecords = res.count;
      });
  }
  selectedProduct: any;
  
  BranchesMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editBrand(this.selectedProduct)
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.showConfirmDelete(this.selectedProduct)
    }
    
  ];
  
  editBrand(user: any) {
    this._router.navigate([`setting/branch/edit/${user?.id}`]);
  }
  deleteBranch(user:any){
    this._sttingService.deleteBranch(user?.id).subscribe(res=>{
      if(res){
        this.getBranches()
      }
    })
  }
  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteBranch(user);
      },
      target: user?.id
    });
  }
  onSearch(): void {
    const formValues = this.filterForm.value;
  
    const queryParts: string[] = [];
  
    Object.keys(formValues).forEach(key => {
      const value = formValues[key];
      if (value !== null && value !== '' && value !== undefined) {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(value).replace(/%20/g, '+'); // Replace space with +
        queryParts.push(`${encodedKey}=${encodedValue}`);
      }
    });
  
    const queryParams = queryParts.join('&');
  
    this.getBranches(queryParams, 1, 10);
  }
  }