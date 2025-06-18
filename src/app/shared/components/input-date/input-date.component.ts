import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-date',
  standalone:false,
  templateUrl: './input-date.component.html',
  styleUrl: './input-date.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputDateComponent),
      multi: true,
    },
  ],
})
export class InputDateComponent {
  @Input() formControlName!: string;
  @Input() showClear: boolean = false;
  @Input() inputSize: 'small' | 'large' = 'small';
  @Input() placeholder: string = '';
  @Input() showIcon: boolean = true;
  @Input() iconDisplay: string = 'input';
  @Input() inputName = '';
  @Input() required = false;

  value: any = ''; // Store value of the input
  disabled: boolean = false; // Track disabled state

  // Access the parent form group
  @Input() parentFormGroup!: FormGroup;

  // Required by ControlValueAccessor
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }


  // Implement setDisabledState (called by Angular to enable/disable the control)
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Handle input changes and trigger the onChange function
  handleInputChange(event: any): void {
    const value = event.value || event;
    this.value = value;
  
    this.onChange(value); // Tell Angular the value changed
    this.onTouched();     // Mark as touched
  }
}
