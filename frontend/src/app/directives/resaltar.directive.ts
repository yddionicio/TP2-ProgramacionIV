import { Directive, ElementRef, HostListener, Input, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appResaltar]',
})
export class ResaltarDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @Input() appResaltar = '#f8fafd';
  private colorOriginal = '';

  @HostListener('mouseenter')
  onMouseEnter() {
    this.colorOriginal = this.el.nativeElement.style.backgroundColor;
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', this.appResaltar);
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'background-color 0.2s ease');
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', this.colorOriginal || '');
  }
}
