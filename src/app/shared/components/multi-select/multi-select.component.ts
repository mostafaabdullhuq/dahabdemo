import {
  Component,
  forwardRef,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChild,
  OnInit
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MultiSelect } from 'primeng/multiselect';
import { SingletonService } from '../../../core/services/singleton.service';

@Component({
  selector: 'app-multi-select',
  standalone:false,
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true
    }
  ]
})
export class MultiSelectComponent implements ControlValueAccessor {
  @Input() id: string = `input-${Math.random().toString(36).substring(2, 15)}`; // unique id
  @Input() label: string = '';
  @Input() options: any[] = [];
  @Input() placeholder: string = 'Select';
  @Input() optionLabel: string = '';
  @Input() pageSize: number = 20; // Default page size
  @Input() apiEndpoint: string = ''; // New input for the API endpoint
  @Input() virtualScroll: boolean = false; // Input to control virtual scroll
  @Input() virtualScrollItemSize: number = 30; // Input for virtualScroll item size
  @Input() optionValue: any = '';
  @Input() required:boolean = false;

  @Output() onScrollToEnd: EventEmitter<void> = new EventEmitter<void>(); // Emit to parent

  selectedValue: any[] = [];

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.selectedValue = value ?? [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onSelectionChange(event: any): void {
    this.selectedValue = event.value;
    this.onChange(this.selectedValue);
    this.onTouched();
  }
}