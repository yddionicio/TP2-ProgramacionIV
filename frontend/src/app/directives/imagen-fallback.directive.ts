import { Directive, HostListener, Input } from '@angular/core';

const DEFAULT_FALLBACK_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e8f0fe"/><circle cx="50" cy="40" r="20" fill="%231a73e8"/><path d="M20,85 C20,65 35,55 50,55 C65,55 80,65 80,85 Z" fill="%231a73e8"/></svg>';

@Directive({
  selector: 'img[appImagenFallback]',
})
export class ImagenFallbackDirective {
  @Input() appImagenFallback: string = DEFAULT_FALLBACK_SVG;
  private falloPrevio = false;

  @HostListener('error', ['$event'])
  onError(e: Event) {
    if (!this.falloPrevio) {
      this.falloPrevio = true;
      const target = e.target as HTMLImageElement;
      target.src = this.appImagenFallback || DEFAULT_FALLBACK_SVG;
    }
  }
}
