package com.pedido.Microservicio_Pedido.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pedido.Microservicio_Pedido.models.entities.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    @Query("select p from Pedido p where p.rut_cliente = :rutCliente")
    List<Pedido> buscarPorRutCliente(@Param("rutCliente") String rutCliente);

    @Query("select p from Pedido p where p.id_usuario = :idUsuario")
    List<Pedido> buscarPorUsuario(@Param("idUsuario") int idUsuario);

    @Query("select p from Pedido p where p.id_venta = :idVenta")
    List<Pedido> buscarPorVenta(@Param("idVenta") int idVenta);
}
