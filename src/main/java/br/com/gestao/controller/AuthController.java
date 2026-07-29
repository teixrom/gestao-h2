package br.com.gestao.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestao.dto.CriarUsuarioRequest;
import br.com.gestao.dto.LoginRequest;
import br.com.gestao.dto.LoginResponse;
import br.com.gestao.entity.Usuario;
import br.com.gestao.entity.Usuario.Role;
import br.com.gestao.repository.UsuarioRepository;
import br.com.gestao.security.TokenService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
            TokenService tokenService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Credenciais invalidas"));
        if (!passwordEncoder.matches(request.senha(), usuario.getSenha())) {
            throw new RuntimeException("Credenciais invalidas");
        }
        String token = tokenService.gerarToken(usuario);
        return ResponseEntity.ok(new LoginResponse(token, usuario.getNome(), usuario.getRole().name()));
    }

    @PostMapping("/registrar")
    public ResponseEntity<Void> registrar(@RequestBody @Valid CriarUsuarioRequest request) {
        if (usuarioRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Email ja cadastrado");
        }
        Role role = request.role() != null ? Role.valueOf(request.role().toUpperCase()) : Role.FUNCIONARIO;
        Usuario usuario = new Usuario(request.email(), request.nome(), passwordEncoder.encode(request.senha()), role);
        usuarioRepository.save(usuario);
        return ResponseEntity.status(201).build();
    }
}
