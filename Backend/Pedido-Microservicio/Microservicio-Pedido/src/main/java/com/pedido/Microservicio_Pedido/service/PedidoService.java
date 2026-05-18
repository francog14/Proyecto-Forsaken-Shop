package com.pedido.Microservicio_Pedido.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import com.pedido.Microservicio_Pedido.models.dto.UsuarioDto;
import com.pedido.Microservicio_Pedido.models.dto.VentaDto;
import com.pedido.Microservicio_Pedido.models.entities.Pedido;
import com.pedido.Microservicio_Pedido.models.request.PedidoActualizarRequest;
import com.pedido.Microservicio_Pedido.models.request.PedidoRequest;
import com.pedido.Microservicio_Pedido.repositories.PedidoRepository;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private WebClient usuarioWebClient;

    @Autowired
    private WebClient ventaWebClient;

    public List<Pedido> obtenerTodosLosPedidos() {
        return pedidoRepository.findAll();
    }

    public Pedido obtenerPedidoPorId(int idPedido) {
        return pedidoRepository.findById(idPedido).orElse(null);
    }

    public List<Pedido> obtenerPedidosPorRut(String rutCliente) {
        return pedidoRepository.buscarPorRutCliente(rutCliente);
    }

    public List<Pedido> obtenerPedidosPorUsuario(int idUsuario) {
        return pedidoRepository.buscarPorUsuario(idUsuario);
    }

    public Pedido crearPedido(PedidoRequest pedidoNuevo) {
        UsuarioDto usuario = validarUsuario(pedidoNuevo.getId_usuario());
        validarVenta(pedidoNuevo.getId_venta());

        Pedido pedido = new Pedido();
        pedido.setId_usuario(pedidoNuevo.getId_usuario());
        pedido.setId_venta(pedidoNuevo.getId_venta());
        pedido.setRut_cliente(normalizarRut(pedidoNuevo.getRut_cliente(), usuario.run()));
        pedido.setEstado(normalizarEstado(pedidoNuevo.getEstado()));
        pedido.setFecha_pedido(pedidoNuevo.getFecha_pedido() != null ? pedidoNuevo.getFecha_pedido() : new Date());

        return pedidoRepository.save(pedido);
    }

    public Pedido actualizarPedido(PedidoActualizarRequest pedidoActualizado) {
        Pedido pedidoExistente = pedidoRepository.findById(pedidoActualizado.getId_pedido()).orElse(null);
        if (pedidoExistente == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado.");
        }

        UsuarioDto usuario = validarUsuario(pedidoActualizado.getId_usuario());
        validarVenta(pedidoActualizado.getId_venta());

        pedidoExistente.setId_usuario(pedidoActualizado.getId_usuario());
        pedidoExistente.setId_venta(pedidoActualizado.getId_venta());
        pedidoExistente.setRut_cliente(normalizarRut(pedidoActualizado.getRut_cliente(), usuario.run()));
        pedidoExistente.setEstado(normalizarEstado(pedidoActualizado.getEstado()));
        pedidoExistente.setFecha_pedido(pedidoActualizado.getFecha_pedido() != null ? pedidoActualizado.getFecha_pedido() : new Date());

        return pedidoRepository.save(pedidoExistente);
    }

    public Pedido actualizarEstado(int idPedido, String estado) {
        Pedido pedidoExistente = pedidoRepository.findById(idPedido).orElse(null);
        if (pedidoExistente == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado.");
        }

        pedidoExistente.setEstado(normalizarEstado(estado));
        return pedidoRepository.save(pedidoExistente);
    }

    public String eliminarPedido(int idPedido) {
        Pedido pedidoExistente = pedidoRepository.findById(idPedido).orElse(null);
        if (pedidoExistente == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado.");
        }

        pedidoRepository.deleteById(idPedido);
        return "Pedido eliminado exitosamente.";
    }

    private UsuarioDto validarUsuario(int idUsuario) {
        try {
            return usuarioWebClient.get()
                    .uri("usuarios/{id_usuario}", idUsuario)
                    .retrieve()
                    .bodyToMono(UsuarioDto.class)
                    .block();
        } catch (WebClientResponseException e) {
            throw new ResponseStatusException(HttpStatus.valueOf(e.getStatusCode().value()),
                    "Error al obtener el usuario: " + e.getStatusText());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Error de conexion con el servicio usuario: " + e.getMessage());
        }
    }

    private VentaDto validarVenta(int idVenta) {
        try {
            return ventaWebClient.get()
                    .uri("ventas/{id_venta}", idVenta)
                    .retrieve()
                    .bodyToMono(VentaDto.class)
                    .block();
        } catch (WebClientResponseException e) {
            throw new ResponseStatusException(HttpStatus.valueOf(e.getStatusCode().value()),
                    "Error al obtener la venta: " + e.getStatusText());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Error de conexion con el servicio venta: " + e.getMessage());
        }
    }

    private String normalizarRut(String rutPedido, String rutUsuario) {
        if (rutPedido == null || rutPedido.isBlank()) {
            return rutUsuario;
        }

        return rutPedido.trim();
    }

    private String normalizarEstado(String estado) {
        if (estado == null || estado.isBlank()) {
            return "PENDIENTE";
        }

        return estado.trim().toUpperCase();
    }
}
