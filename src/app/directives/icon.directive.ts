import { HttpClient } from '@angular/common/http';
import { Directive, ElementRef, HostListener, inject, Input, OnInit, Renderer2 } from '@angular/core';
import { catchError, of } from 'rxjs';

@Directive({
  selector: '[appIcon]',
})
export class IconDirective implements OnInit{

  @Input('appIcon') fileName: string = '';
  @Input() color: string = ''; // Opcional
  @Input() width?: string; // Opcional
  @Input() height?: string; // Opcional
  @Input() stroke?: string; // Opcional

  private static cache = new Map<string, string>();

  private host = inject(ElementRef);
  private renderer = inject(Renderer2);
  private httpClient = inject(HttpClient);

  private readonly fallbackSvg  = `assets/svg/error.svg`;

  ngOnInit(): void {
    this.getResource();
  }

  getResource(): void {
    const extension = this.fileName.split('.').pop()?.toLowerCase() || '';

    const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension);
    const isSvg = extension === 'svg';

     // Si es imagen, usar <img>
    if (isImage) {
      const localUrl = `assets/image/${this.fileName}`;
      const alt = this.fileName ? this.fileName.split('.').shift() : '';
      this.renderImg(localUrl, alt);
      return;
    }

    // Si es SVG, cargar inline
    if(isSvg){
      const localUrl = `assets/svg/${this.fileName}`;
      this.setAttributesSvg(localUrl)
    }else{
      console.warn('[Icon] Extensión no soportada:', extension);
    }
  }

  private setAttributesSvg(url: string): void {
    const tryFromCache = (key: string) => IconDirective.cache.get(key) || null;
    if (tryFromCache(url)) {
      return this.renderSvg(tryFromCache(url)!, url);
    }
    this.httpClient.get(url, { responseType: 'text' })
    .pipe(
      catchError(() => {
        console.warn('[Icon] SVG no encontrado, cargando fallback');
        return this.httpClient.get(this.fallbackSvg, { responseType: 'text' });
      }),
      catchError(() => {
        // Mostrar unicamente si el svg de fallback no funciona
        console.warn('[Icon] SVG fallback no encontrado, cargando default fallback');
        return of(this.defaultSvgError());
      })
    )
    .subscribe(svgText => this.renderSvg(svgText, url));
  }

  private renderImg(url: string, alt: string = ''): void {
    const img: HTMLImageElement = this.renderer.createElement('img');
    this.renderer.setAttribute(img, 'src', url);
    this.renderer.setAttribute(img, 'alt', alt);
    if (this.width) this.renderer.setStyle(img, 'width', this.width);
    if (this.height) this.renderer.setStyle(img, 'height', this.height);
    this.loadImgFallback(img);
    this.replaceHostWith(img);
  }

  private renderSvg(iconText: string, key: string): void {
    IconDirective.cache.set(key, iconText);

    const parser = new DOMParser();
    const svg = parser.parseFromString(iconText, 'image/svg+xml').documentElement;

    if (svg instanceof SVGSVGElement) {
      this.sanitizeSvg(svg);
      if (this.color) svg.setAttribute('fill', this.color);
      if (this.width) svg.setAttribute('width', this.width);
      if (this.height) svg.setAttribute('height', this.height);
      if (this.stroke) svg.setAttribute('stroke', this.stroke);
      this.replaceHostWith(svg);
    }else{
      this.createSvgFallback();
    }
  }

  private sanitizeSvg(svg: SVGSVGElement) {
    const elementsWithFill = svg.querySelectorAll('[fill]');
    elementsWithFill.forEach(el => {
      el.setAttribute('fill', this.color || 'currentColor');
    });

    const elementsWithStroke = svg.querySelectorAll('[stroke]');
    elementsWithStroke.forEach(el => {
      el.setAttribute('stroke', this.stroke || 'currentColor');
    });

    if (!this.width) svg.removeAttribute('width');
    if (!this.height) svg.removeAttribute('height');
    if (!this.color) svg.removeAttribute('fill');
    if (!this.stroke) svg.removeAttribute('stroke');
  }

  private replaceHostWith(node: HTMLElement | SVGSVGElement) {
    const parent = this.host.nativeElement.parentNode;
    if (parent) {
      parent.replaceChild(node, this.host.nativeElement);
    }
  }

  private createSvgFallback(): SVGSVGElement {
    const fallback = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    fallback.setAttribute('viewBox', '0 0 24 24');
    fallback.setAttribute('width', this.width || '24');
    fallback.setAttribute('height', this.height || '24');
    fallback.innerHTML = `<text x="0" y="15" fill="red">❌</text>`;
    return fallback;
  }

  private defaultSvgError(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <text x="0" y="15" fill="red">❌</text>
    </svg>`;
  }

  // Cargar la imagen de fallback en caso se que la imagen no se encuentre
  @HostListener('error')
  loadImgFallback(image: HTMLImageElement){
    if(image instanceof HTMLImageElement){
      console.warn('[Image] IMAGE no encontrado, cargando fallback');
      image.src = 'assets/svg/image-broken.svg';
      image.alt = 'image broken';
    }
  }

}
