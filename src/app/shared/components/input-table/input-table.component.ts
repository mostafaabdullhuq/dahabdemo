import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-input-table',
  standalone:false,
  templateUrl: './input-table.component.html',
  styleUrl: './input-table.component.scss'
})
export class InputTableComponent {
  @Input() data: any = [];

  @ContentChild('headerTemplate', { static: false }) headerTemplate!: TemplateRef<any>;
  @ContentChild('bodyTemplate', { static: false }) bodyTemplate!: TemplateRef<any>;
}
