package com.pedido.Microservicio_Pedido.models.dto;

import java.util.Date;

public record VentaDto(int id_venta, Date fecha, double total, int id_usuario) {
}
