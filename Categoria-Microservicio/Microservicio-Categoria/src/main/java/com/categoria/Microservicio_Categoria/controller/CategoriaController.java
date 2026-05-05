package com.categoria.Microservicio_Categoria.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.categoria.Microservicio_Categoria.models.entities.Categoria;
import com.categoria.Microservicio_Categoria.service.CategoriaService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("categorias")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    @GetMapping("")
    public List<Categoria> obtenerTodasCategorias() {
        return categoriaService.obtenerTodasCategorias();
    }
    
    @GetMapping("/{id_categoria}")
    public Categoria obtenerCategoria(@PathVariable int id_categoria) {
        return categoriaService.obtenerCategoriaPorId(id_categoria);
    }

}
