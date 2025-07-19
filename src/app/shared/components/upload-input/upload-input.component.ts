import { Component, forwardRef, Input, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-upload-input',
  standalone: false,
  templateUrl: './upload-input.component.html',
  styleUrl: './upload-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadInputComponent),
      multi: true
    }
  ]
})
export class UploadInputComponent {
  @Input() label: string = 'Choose Image';
  @Input() accept: string = 'image/*';
  @Input() maxFileSize: number = 1000000;
  @Input() disabled: boolean = false;
  @Input() showDelete: boolean = true;
  @ViewChild('fileInput') fileInput: any;

  file: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  private onChange = (value: File | null) => { };
  private onTouched = () => { };

  writeValue(value: File | string | null): void {
    if (value instanceof File) {
      this.file = value;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(value);
    } else if (typeof value === 'string' && value) {
      this.file = null;
      this.previewUrl = value;
    } else {
      this.file = null;
      this.previewUrl = null;
    }
  }

  registerOnChange(fn: any): void {

    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  handleFileInput(event: any): void {
    const file = event.target.files[0];
    if (file && file.size <= this.maxFileSize) {
      this.file = file;
      this.onChange(file);
      this.onTouched();

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  reset() {
    this.fileInput.nativeElement.value = '';
    this.file = null;
    this.previewUrl = null;
  }
}
