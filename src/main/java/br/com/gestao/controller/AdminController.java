package br.com.gestao.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestao.entity.Usuario;
import br.com.gestao.entity.Usuario.Role;
import br.com.gestao.repository.UsuarioRepository;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/usuarios")
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @PostMapping("/usuarios")
    public ResponseEntity<Usuario> criarUsuario(@RequestBody Map<String, String> body) {
        if (usuarioRepository.findByEmail(body.get("email")).isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        String roleStr = body.getOrDefault("role", "FUNCIONARIO").toUpperCase();
        Role role;
        try {
            role = Role.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        Usuario usuario = new Usuario(body.get("email"), body.get("nome"),
                passwordEncoder.encode(body.get("senha")), role);
        return ResponseEntity.status(201).body(usuarioRepository.save(usuario));
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<Usuario> atualizarUsuario(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        if (body.containsKey("nome")) usuario.setNome(body.get("nome"));
        if (body.containsKey("email")) usuario.setEmail(body.get("email"));
        return ResponseEntity.ok(usuarioRepository.save(usuario));
    }

    @PutMapping("/usuarios/{id}/role")
    public ResponseEntity<Usuario> alterarRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        Role role = Role.valueOf(body.get("role").toUpperCase());
        usuario.setRole(role);
        return ResponseEntity.ok(usuarioRepository.save(usuario));
    }

    @PutMapping("/usuarios/{id}/ativo")
    public ResponseEntity<Void> toggleAtivo(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        usuario.setAtivo(!usuario.isAtivo());
        usuarioRepository.save(usuario);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/usuarios/{id}/senha")
    public ResponseEntity<Void> resetarSenha(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        usuario.setSenha(passwordEncoder.encode(body.get("senha")));
        usuarioRepository.save(usuario);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> excluirUsuario(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        usuarioRepository.delete(usuario);
        return ResponseEntity.noContent().build();
    }
}
