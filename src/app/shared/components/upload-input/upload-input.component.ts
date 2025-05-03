import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { UploadEvent } from 'primeng/fileupload';

@Component({
  selector: 'app-upload-input',
  standalone:false,
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

  file: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  private onChange = (value: File | null) => {};
  private onTouched = () => {};

  writeValue(value: File | null): void {
    this.file = value;
    if (value) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(value);
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
}
