import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-dropdowns',
  standalone: false,
  templateUrl: './dropdowns.component.html',
  styleUrl: './dropdowns.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownsComponent),
      multi: true
    }
  ]
})
export class DropdownsComponent implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() id: string = `input-${Math.random().toString(36).substring(2, 15)}`; // unique id
  @Input() optionLabel: string = '';
  @Input() optionValue: any = '';
  @Input() disabled: boolean = false;
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Output() selectionChange = new EventEmitter<any>();
  @Input() required:boolean = false;
  @Output() valueChange = new EventEmitter<any>();
  @Input() value: any;

  selectedValue: any = '';

  // ControlValueAccessor hooks
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  // Called when value is written from outside (form model or programmatically)
  writeValue(value: any): void {
    this.selectedValue = value;

    // Emit changes to notify parent
    this.onChange(this.selectedValue);
    this.selectionChange.emit(this.selectedValue);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // User changes selection
  onSelectionChange(event: any): void {
    this.selectedValue = event.value; // PrimeNG passes `{originalEvent, value}`

    this.onChange(this.selectedValue);
    this.selectionChange.emit(this.selectedValue);
    this.valueChange.emit(this.selectedValue); // Optional if two-way binding is needed
  }

  onBlur(): void {
    this.onTouched();
  }
}