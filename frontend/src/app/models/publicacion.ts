export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
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