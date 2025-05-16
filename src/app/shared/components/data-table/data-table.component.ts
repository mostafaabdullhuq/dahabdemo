import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-data-table',
  standalone:false,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnInit {
  @Input() data!: any[];
  @Input() cols!: any[];
  @Input() totalRecords!: number;
  @Input() first!: number;
  @Input() rows!: number;
  @Output() pageChange: EventEmitter<any> = new EventEmitter();
  @Input() contextMenuItems: MenuItem[] = [];
  @Input() paginator :boolean = true
  selectedRow: any;
@Output() rowSelected = new EventEmitter<any>();

@Input() getRowData?: (row: any) => MenuItem[]; // Optional function if parent wants dynamic rows

getActions(rowData: any): MenuItem[] {
  if (this.getRowData) {
    return this.getRowData(rowData);
  }
  return this.contextMenuItems;
}
onContextMenuRowSelect(row: any) {
  this.selectedRow = row;
  this.rowSelected.emit(row);
}

onRowClick(row: any) {
  this.selectedRow = row;
  this.rowSelected.emit(row);
}
  ngOnInit() {
  }

  onPageChange(event: any): void {
    this.pageChange.emit(event);
  }

  viewRow(row: any): void {
    console.log('Viewing:', row);
    // Trigger a custom output or action
  }

  deleteRow(row: any): void {
    console.log('Deleting:', row);
    this.data = this.data.filter(r => r.id !== row.id); // Or emit to parent to handle
  }
  resolveFieldData(data: any, field: string): any {
    if (!data || !field) return null;
    return field.split('.').reduce((obj, key) => (obj ? obj[key] : null), data);
  }
}

