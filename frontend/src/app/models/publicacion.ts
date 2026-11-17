export type CategoriaPublicacion = 'idea' | 'proyecto' | 'consejo' | 'solucion';

export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  categoria?: CategoriaPublicacion;
  imagenUrl?: string;
  autor: { _id: string; nombreUsuario: string; imagenPerfil?: string };
  likesCount: number;
  meGusta: boolean;
  createdAt: string;
}

export interface PaginaPublicaciones {
  items: Publicacion[];
  total: number;
  offset: number;
  limit: number;
}

export interface RankingItem {
  posicion: number;
  puntos: number;
  publicacion: {
    _id: string;
    titulo: string;
    mensaje: string;
    categoria: CategoriaPublicacion;
    imagenUrl?: string;
    createdAt: string;
    likesCount?: number;
    autor: {
      _id: string;
      nombreUsuario: string;
      imagenPerfil?: string;
    };
  };
}

export interface RankingRespuesta {
  periodo: 'semana' | 'mes' | 'total';
  items: RankingItem[];
}
