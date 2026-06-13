package com.prenda.Microservicio_Prenda.controller;

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

import com.prenda.Microservicio_Prenda.models.entities.Prenda;
import com.prenda.Microservicio_Prenda.models.request.PrendaActualizarRequest;
import com.prenda.Microservicio_Prenda.models.request.PrendaRequest;
import com.prenda.Microservicio_Prenda.service.PrendaService;

@RequestMapping("/prendas")
@RestController
public class PrendaController {

    @Autowired
    private PrendaService prendaService;

    @GetMapping("")
    public List<Prenda> obtenerTodasLasPrendas() {
        return prendaService.obtenerTodasLasPrendas();
    }
    
    @GetMapping("/{id_prenda}")
    public Prenda obtenerPrendaPorId(@PathVariable int id_prenda){
        return prendaService.obtenePrendaPorId(id_prenda);
    }

    @PostMapping("")
    public Prenda agregarPrenda(@RequestBody PrendaRequest prendaNueva){
        return prendaService.agregarPrenda(prendaNueva);
    }
    
    @PutMapping("")
    public Prenda actualizarPrenda(@RequestBody PrendaActualizarRequest prendaActualizada){
        return prendaService.actualizarPrenda(prendaActualizada);
    }

    @DeleteMapping("/{id_prenda}")
    public String eliminarPrenda(@PathVariable int id_prenda){
        return prendaService.eliminarPrenda(id_prenda);
    }

}
