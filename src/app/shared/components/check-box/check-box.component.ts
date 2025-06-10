import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-check-box',
standalone:false,
  templateUrl: './check-box.component.html',
  styleUrl: './check-box.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckBoxComponent),
      multi: true,
    },
  ],
})
export class CheckBoxComponent {
  @Input() inputId!: any;
  @Input() label!: string;

  private _checked = false;

  @Input()
  get checked(): boolean {
    return this._checked;
  }
  set checked(val: boolean) {
    this._checked = val;
    this.value = val;
  }

  value: boolean = false;
  disabled: boolean = false;

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    this.value = !!obj;
    this._checked = this.value; // sync checked too
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  toggleCheck(): void {
    if (this.disabled) return;
    this.onChange(this.value);
    this.onTouched();
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
