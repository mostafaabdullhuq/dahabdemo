import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { BusinessSettingComponent } from './business-setting/business-setting.component';
import { CustomFieldsComponent } from './custom-fields/custom-fields.component';

@Component({
  selector: 'app-business',
  imports: [SharedModule , BusinessSettingComponent , CustomFieldsComponent],
  templateUrl: './business.component.html',
  styleUrl: './business.component.scss'
})
export class BusinessComponent {

}
