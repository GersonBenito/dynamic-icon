import { HttpClient } from '@angular/common/http';
import { Directive, ElementRef, inject, Input, OnInit, Renderer2 } from '@angular/core';
import { catchError, of } from 'rxjs';

@Directive({
  selector: '[appIconCopy]'
})
export class IconDirectiveCopy implements OnInit{

  @Input() fileName: string = '';
  @Input() color: string = ''; // Opcional
  @Input() width?: string; // Opcional
  @Input() height?: string; // Opcional

  private static cache = new Map<string, string>();

  private readonly baseUrl: string = 'https://cdn.tusitio.com/icons';

  private elemntRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private httpClient = inject(HttpClient);

  ngOnInit(): void {
    this.getResource();
  }

  getResource(): void {
    const serverUrl = `${this.baseUrl}/${this.fileName}`;
    const localUrl = `assets/svg/${this.fileName}`;
    const fallbackIcon = `${localUrl}error.svg`;

    console.log('local url -->', localUrl);
    
    // const tryLoadFromCache = (key: string) => IconDirective.cache.get(key) || null;

    const renderSvg = (iconText: string, key: string) => {
      IconDirectiveCopy.cache.set(key, iconText); // Guardar en cache

      const parser = new DOMParser();
      const iconElement = parser.parseFromString(iconText, 'image/svg+xml').documentElement;

      if(iconElement instanceof SVGSVGElement){
        this.sanitizeSvg(iconElement);
        console.log('color -->', this.color);
        
        if (this.color) iconElement.setAttribute('fill', this.color);
        if (this.width) iconElement.setAttribute('width', this.width);
        if (this.height) iconElement.setAttribute('height', this.height);

        this.renderer.setProperty(this.elemntRef.nativeElement, 'innerHTML', '');
        this.renderer.appendChild(this.elemntRef.nativeElement, iconElement);
      }else{
        console.warn('[Icon] El archivo no es un SVG válido. Se insertará fallback directo.');
        this.renderer.setProperty(
          this.elemntRef.nativeElement,
          'innerHTML',
          `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width || 24}" height="${this.height || 24}" fill="${this.color || 'red'}" viewBox="0 0 24 24">
             <text x="0" y="15">❌</text>
           </svg>`
        );
      }
    };

    // Cache check
    const tryFromCache = (key: string) => IconDirectiveCopy.cache.get(key) || null;
    if (tryFromCache(serverUrl)) return renderSvg(tryFromCache(serverUrl)!, serverUrl);
    if (tryFromCache(localUrl)) return renderSvg(tryFromCache(localUrl)!, localUrl);

     // Leerlo desde server, en caso de error de forma local
    this.httpClient.get(serverUrl, { responseType: 'text' }).pipe(
     catchError(() => {
       console.warn(`[Icon] No se encontró en servidor: ${serverUrl}`);
       return this.httpClient.get(localUrl, { responseType: 'text' });
     }),
     catchError(() => {
       console.warn(`[Icon] No se encontró localmente: ${localUrl}`);
       return this.httpClient.get(fallbackIcon, { responseType: 'text' });
     }),
     catchError(() => {
       console.error(`[InlineSvg] Error: No se encontró el fallback "${fallbackIcon}"`);
       return of('<svg><text x="0" y="15" fill="red">⚠️ SVG no encontrado</text></svg>');
     })
    ).subscribe(svgText => {
      const key = svgText.includes('⚠️') ? 'error-fallback' : this.fileName;
      renderSvg(svgText, key);
    });
  }

  private sanitizeSvg(svg: SVGSVGElement) {
    const elementsWithFill = svg.querySelectorAll('[fill]');
    elementsWithFill.forEach(el => {
      el.setAttribute('fill', this.color);
    });

    if (!this.width) svg.removeAttribute('width');
    if (!this.height) svg.removeAttribute('height');
    if (!this.color) svg.removeAttribute('fill');
  }

}
