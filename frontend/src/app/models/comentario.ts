export interface Comentario {
  _id: string;
  publicacion: string;
  autor: {
    _id: string;
    nombreUsuario: string;
    imagenPerfil?: string;
  };
  mensaje: string;
  modificado: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginaComentarios {
  items: Comentario[];
  total: number;
  offset: number;
  limit: number;
}
