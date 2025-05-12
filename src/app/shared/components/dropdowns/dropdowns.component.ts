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
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Output() selectionChange = new EventEmitter<any>();
  @Input() required:boolean = false;
  @Output() valueChange = new EventEmitter<any>();
  @Input() value: any;

  selectedValue: any = '';

  // These are needed for ControlValueAccessor to handle the model binding
  onChange: (value: any) => void = () => { };
  onTouched: () => void = () => { };

  // This method is called when the value changes from the form model
  writeValue(value: any): void {
    if (value) {
      this.selectedValue = value;
    }
  }

  // This method is called when the value of the model changes
  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  // This method is called when the control is touched
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Trigger change event when selection is modified
  onSelectionChange(event: any) {
    this.onChange(this.selectedValue);
    this.selectionChange.emit(this.selectedValue);
  }

  // Mark control as touched when input is blurred
  onBlur() {
    this.onTouched();
  }
}