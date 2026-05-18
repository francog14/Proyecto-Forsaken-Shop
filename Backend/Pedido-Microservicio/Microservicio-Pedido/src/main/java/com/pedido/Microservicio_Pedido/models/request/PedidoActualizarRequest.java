package com.pedido.Microservicio_Pedido.models.request;

import java.util.Date;

import lombok.Data;

@Data
public class PedidoActualizarRequest {
    private int id_pedido;
    private int id_usuario;
    private int id_venta;
    private String rut_cliente;
    private String estado;
    private Date fecha_pedido;
}
