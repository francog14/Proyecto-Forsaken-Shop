package com.prenda.Microservicio_Prenda.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.prenda.Microservicio_Prenda.repositories.PrendaRepository;

@Service
public class PrendaService {

    @Autowired
    private PrendaRepository prendaRepository;

    
    
}
