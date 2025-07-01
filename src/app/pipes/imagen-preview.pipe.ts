import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imagenPreview',
  standalone: true
})
export class ImagenPreviewPipe implements PipeTransform {
  transform(file: File): string {
    return URL.createObjectURL(file);
  }
}
