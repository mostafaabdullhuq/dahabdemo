import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-input-table',
  standalone:false,
  templateUrl: './input-table.component.html',
  styleUrl: './input-table.component.scss'
})
export class InputTableComponent {
  @Input() data: any = [];
  @Input() height: any ='auto' ;
  @ContentChild('headerTemplate', { static: false }) headerTemplate!: TemplateRef<any>;
  @ContentChild('bodyTemplate', { static: false }) bodyTemplate!: TemplateRef<any>;
}
