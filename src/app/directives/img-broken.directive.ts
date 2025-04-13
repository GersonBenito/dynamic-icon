import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';

@Directive({
  selector: '[appImgBroken]'
})
export class ImgBrokenDirective {

  @Input() urlCustom?: string;
  private readonly elementRef = inject(ElementRef);

  @HostListener('error')
  loadImgFallback(){
    const element = this.elementRef.nativeElement;
    if(element instanceof HTMLImageElement){
      element.src = this.urlCustom || 'assets/svg/image-broken.svg';
      element.alt = 'image broken';
    }
  }
}
