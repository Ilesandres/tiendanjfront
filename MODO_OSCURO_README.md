# 🌙 Modo Oscuro - Tienda NJ

## ✅ Funcionalidades Implementadas

### 1. **Servicio de Tema (`ThemeService`)**
- Manejo centralizado del estado del tema
- Persistencia en localStorage
- Detección automática de preferencia del sistema
- Transiciones suaves entre temas

### 2. **Switch en la Navbar**
- Toggle visual con iconos (☀️/🌙)
- Animación suave del switch
- Accesibilidad con aria-labels
- Responsive design

### 3. **Variables CSS Dinámicas**
- **Modo Claro**: Colores claros y legibles
- **Modo Oscuro**: Colores oscuros con buen contraste
- Transiciones suaves en todos los elementos

### 4. **Componentes Actualizados**
- Navbar con switch de tema
- Todos los elementos UI adaptados
- Formularios, tablas, botones, alertas
- Cards y contenedores

## 🎨 Paleta de Colores

### Modo Claro
- Fondo: `#f8fafc`
- Texto principal: `#1e293b`
- Texto secundario: `#64748b`
- Bordes: `#e2e8f0`
- Cards: `white`

### Modo Oscuro
- Fondo: `#0f172a`
- Texto principal: `#f1f5f9`
- Texto secundario: `#cbd5e1`
- Bordes: `#334155`
- Cards: `#1e293b`

## 🚀 Cómo Usar

### Para el Usuario
1. **Cambiar Tema**: Haz clic en el switch ☀️/🌙 en la navbar
2. **Persistencia**: El tema se guarda automáticamente
3. **Preferencia del Sistema**: Si no has elegido tema, se usa la preferencia de tu sistema

### Para el Desarrollador

#### Agregar el servicio a un componente:
```typescript
import { ThemeService, Theme } from '../../services/theme.service';

export class MiComponente {
  currentTheme: Theme = 'light';

  constructor(private themeService: ThemeService) {
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
```

#### Usar en el template:
```html
<button 
  class="theme-switch" 
  [class.dark]="currentTheme === 'dark'"
  (click)="toggleTheme()"
>
</button>
```

#### Agregar estilos para modo oscuro:
```css
/* En tu archivo CSS */
.mi-elemento {
  background-color: var(--card-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

## 📱 Responsive Design
- El switch se adapta a pantallas pequeñas
- En móviles, el switch se centra debajo de la información del usuario
- Todos los elementos mantienen su funcionalidad en cualquier tamaño

## 🎯 Demo
Visita `/theme-demo` para ver una demostración completa del modo oscuro con todos los elementos de la UI.

## 🔧 Archivos Modificados
- `src/app/services/theme.service.ts` (nuevo)
- `src/app/shared/navbar/navbar.component.ts`
- `src/app/shared/navbar/navbar.component.html`
- `src/app/shared/navbar/navbar.component.css`
- `src/styles.css`
- `src/app/app.routes.ts`

## 🎨 Componente de Demo
- `src/app/shared/theme-demo/` (nuevo)
- Muestra todos los elementos UI en ambos temas
- Incluye formularios, tablas, botones, alertas
- Perfecto para testing y demostración

## ✨ Características Técnicas
- **RxJS**: Uso de BehaviorSubject para estado reactivo
- **CSS Variables**: Cambio dinámico de colores
- **localStorage**: Persistencia de preferencias
- **Media Queries**: Detección de preferencia del sistema
- **Transiciones CSS**: Animaciones suaves
- **Accesibilidad**: Aria-labels y navegación por teclado 