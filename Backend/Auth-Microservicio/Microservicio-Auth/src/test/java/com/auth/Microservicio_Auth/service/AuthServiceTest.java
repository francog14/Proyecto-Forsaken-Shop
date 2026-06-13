package com.auth.Microservicio_Auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.auth.Microservicio_Auth.models.entities.AuthUsuario;
import com.auth.Microservicio_Auth.models.request.LoginRequest;
import com.auth.Microservicio_Auth.models.response.AuthResponse;
import com.auth.Microservicio_Auth.repositories.AuthUsuarioRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthUsuarioRepository authUsuarioRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginConCredencialesValidasRetornaSesion() {
        AuthUsuario usuario = new AuthUsuario();
        usuario.setId_auth(1);
        usuario.setNombre("Admin Forsaken");
        usuario.setEmail("admin@forsaken.cl");
        usuario.setPassword("admin123");
        usuario.setRol("ADMIN");

        LoginRequest request = new LoginRequest();
        request.setEmail("admin@forsaken.cl");
        request.setPassword("admin123");

        when(authUsuarioRepository.findByEmail("admin@forsaken.cl")).thenReturn(Optional.of(usuario));

        AuthResponse response = authService.login(request);

        String tokenEsperado = Base64.getEncoder()
                .encodeToString("admin@forsaken.cl:ADMIN".getBytes(StandardCharsets.UTF_8));

        assertEquals(1, response.id_auth());
        assertEquals("Admin Forsaken", response.nombre());
        assertEquals("admin@forsaken.cl", response.email());
        assertEquals("ADMIN", response.rol());
        assertEquals(tokenEsperado, response.token());
        assertFalse(response.token().isBlank());
    }
}
