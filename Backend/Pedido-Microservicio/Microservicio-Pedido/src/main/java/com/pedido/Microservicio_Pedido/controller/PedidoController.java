package com.pedido.Microservicio_Pedido.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pedido.Microservicio_Pedido.models.entities.Pedido;
import com.pedido.Microservicio_Pedido.models.request.EstadoPedidoRequest;
import com.pedido.Microservicio_Pedido.models.request.PedidoActualizarRequest;
import com.pedido.Microservicio_Pedido.models.request.PedidoRequest;
import com.pedido.Microservicio_Pedido.service.PedidoService;

@RequestMapping("/pedidos")
@RestController
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @GetMapping("")
    public List<Pedido> obtenerTodosLosPedidos() {
        return pedidoService.obtenerTodosLosPedidos();
    }

    @GetMapping("/{id_pedido}")
    public Pedido obtenerPedidoPorId(@PathVariable int id_pedido) {
        return pedidoService.obtenerPedidoPorId(id_pedido);
    }

    @GetMapping("/rut/{rut_cliente}")
    public List<Pedido> obtenerPedidosPorRut(@PathVariable String rut_cliente) {
        return pedidoService.obtenerPedidosPorRut(rut_cliente);
    }

    @GetMapping("/usuario/{id_usuario}")
    public List<Pedido> obtenerPedidosPorUsuario(@PathVariable int id_usuario) {
        return pedidoService.obtenerPedidosPorUsuario(id_usuario);
    }

    @PostMapping("")
    public Pedido crearPedido(@RequestBody PedidoRequest pedidoNuevo) {
        return pedidoService.crearPedido(pedidoNuevo);
    }

    @PutMapping("")
    public Pedido actualizarPedido(@RequestBody PedidoActualizarRequest pedidoActualizado) {
        return pedidoService.actualizarPedido(pedidoActualizado);
    }

    @PutMapping("/{id_pedido}/estado")
    public Pedido actualizarEstado(@PathVariable int id_pedido, @RequestBody EstadoPedidoRequest request) {
        return pedidoService.actualizarEstado(id_pedido, request.getEstado());
    }

    @DeleteMapping("/{id_pedido}")
    public String eliminarPedido(@PathVariable int id_pedido) {
        return pedidoService.eliminarPedido(id_pedido);
    }
}
