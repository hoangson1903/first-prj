package vn.macmoc.store.controller;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpStatus;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import vn.macmoc.store.dto.AuthRequests;
import vn.macmoc.store.model.StoreUser;
import vn.macmoc.store.repository.UserRepository;
import vn.macmoc.store.service.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody AuthRequests.Register request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Mật khẩu không được dài quá 72 byte UTF-8");
        }
        String email = request.email().trim().toLowerCase();
        if (users.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email này đã được đăng ký");
        }
        StoreUser user;
        try {
            user = users.save(new StoreUser(request.name().trim(), email,
                    passwordEncoder.encode(request.password()), "CUSTOMER"));
        } catch (DuplicateKeyException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email này đã được đăng ký");
        }
        return response(user);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequests.Login request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không chính xác");
        }
        var user = users.findByEmailIgnoreCase(request.email().trim())
                .filter(candidate -> passwordEncoder.matches(request.password(), candidate.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Email hoặc mật khẩu không chính xác"));
        return response(user);
    }

    @GetMapping("/me")
    public UserProfile me(HttpServletRequest request) {
        var principal = requireUser(request);
        var user = users.findById(principal.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));
        return new UserProfile(user.getName(), user.getEmail(), user.getRole());
    }

    static JwtService.UserPrincipal requireUser(HttpServletRequest request) {
        Object principal = request.getAttribute("authenticatedUser");
        if (!(principal instanceof JwtService.UserPrincipal userPrincipal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        }
        return userPrincipal;
    }

    private AuthResponse response(StoreUser user) {
        return new AuthResponse(jwtService.issue(user), new UserProfile(user.getName(), user.getEmail(), user.getRole()));
    }

    public record UserProfile(String name, String email, String role) {}
    public record AuthResponse(String token, UserProfile user) {}
}
