import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-group-permissions',
  imports: [SharedModule],
  templateUrl: './group-permissions.component.html',
  styleUrl: './group-permissions.component.scss'
})
export class GroupPermissionsComponent {
  @Input() permissions: { id: number; name: string }[] = [];

  permissionForm!: FormGroup;
  grouped: { [module: string]: { action: string; id: number; fullName: string }[] } = {};

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.groupPermissions();

    const controlsConfig: any = {};
    for (const module in this.grouped) {
      this.grouped[module].forEach(perm => {
        controlsConfig[perm.fullName] = [false];
      });
    }

    this.permissionForm = this.fb.group(controlsConfig);
  }

  groupPermissions(): void {
    for (let perm of this.permissions) {
      console.log(this.permissions);
      
      const segments = perm.name.split('.');
      const module = segments.slice(0, -1).join('.');
      const action = segments[segments.length - 1];
      if (!this.grouped[module]) this.grouped[module] = [];
      this.grouped[module].push({ action, id: perm.id, fullName: perm.name });
    }
  }

  getSelectedPermissions(): string[] {
    return Object.entries(this.permissionForm.value)
      .filter(([_, checked]) => checked)
      .map(([name]) => name);
  }
  getModules(): string[] {
    return Object.keys(this.grouped);
  }
}
