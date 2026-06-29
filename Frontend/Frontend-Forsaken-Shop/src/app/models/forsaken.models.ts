export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
}

export interface Rol {
  id_rol: number;
  nombre_rol: string;
}

export interface Usuario {
  id_usuario: number;
  run: string;
  nombre: string;
  email: string;
  id_rol: number;
}

export interface Prenda {
  id_prenda: number;
  nombre_prenda: string;
  precio_prenda: number;
  talla: string;
  color: string;
  stock_prenda: number;
  id_categoria: number;
}

export interface Venta {
  id_venta: number;
  fecha: string;
  total: number;
  id_usuario: number;
}

export interface DetalleVenta {
  id_detalle_venta: number;
  id_venta: number;
  id_prenda: number;
  cantidad: number;
  precio_unitario: number;
}

export interface Mensaje {
  id_mensaje: number;
  id_usuario: number;
  asunto: string;
  contenido: string;
  fecha_envio: string;
}

export interface Pedido {
  id_pedido: number;
  id_usuario: number;
  id_venta: number;
  rut_cliente: string;
  estado: string;
  fecha_pedido: string;
}

export interface AuthSession {
  id_auth: number;
  nombre: string;
  email: string;
  rol: string;
  token: string;
}

export type Actor = 'usuario' | 'vendedor' | 'bodeguero' | 'admin';

export type CategoriaForm = Omit<Categoria, 'id_categoria'>;
export type RolForm = Omit<Rol, 'id_rol'>;
export type UsuarioForm = Omit<Usuario, 'id_usuario'>;
export type PrendaForm = Omit<Prenda, 'id_prenda'>;
export type VentaForm = Omit<Venta, 'id_venta'>;
export type DetalleVentaForm = Omit<DetalleVenta, 'id_detalle_venta'>;
export type MensajeForm = Omit<Mensaje, 'id_mensaje'>;
export type PedidoForm = Omit<Pedido, 'id_pedido'>;

export interface CarritoItem {
  prenda: Prenda;
  cantidad: number;
}

export interface ComprobanteItem {
  nombre: string;
  cantidad: number;
  precio: number;
}
