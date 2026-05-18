package com.pedido.Microservicio_Pedido.models.entities;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_pedido;

    @Column(nullable = false)
    private int id_usuario;

    @Column(nullable = false)
    private int id_venta;

    @Column(nullable = false)
    private String rut_cliente;

    @Column(nullable = false)
    private String estado;

    @Column(nullable = false)
    private Date fecha_pedido;
}
