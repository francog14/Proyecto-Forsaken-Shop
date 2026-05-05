package com.prenda.Microservicio_Prenda.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    //categoria
    @Bean
    public WebClient categoriaWebClient(){
        return WebClient.builder()
        .baseUrl("http://localhost:7070/").build();
    }

}
