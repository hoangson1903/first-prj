package vn.macmoc.store.config;

import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.macmoc.store.model.Product;
import vn.macmoc.store.model.StoreUser;
import vn.macmoc.store.repository.ProductRepository;
import vn.macmoc.store.repository.UserRepository;

@Configuration
public class SeedData {
    @Bean
    CommandLineRunner seedProducts(ProductRepository products) {
        return args -> {
            if (products.count() > 0) return;
            products.saveAll(List.of(
                    product("ao-thun-nang", "Áo thun Nắng", "Áo thun", "Cotton 100% mềm mại, phom dáng rộng vừa, thoáng mát cho mọi ngày.", 329000, 390000.0, "photo-1521572163474-6864f9cf17ab", true, 28),
                    product("so-mi-linen", "Sơ mi Linen Mây", "Áo sơ mi", "Chất linen tự nhiên, nhẹ tênh và thoáng khí cho ngày hè.", 549000, null, "photo-1598033129183-c4f50c736f10", true, 18),
                    product("quan-ong-rong", "Quần ống rộng Nâu", "Quần", "Phom suông thanh lịch, chất vải đứng dáng nhưng vẫn dễ chịu.", 629000, null, "photo-1473966968600-fa801b869a1a", true, 15),
                    product("ao-khoac-cham", "Áo khoác Chàm", "Áo khoác", "Lớp khoác nhẹ với gam màu chàm trầm, dễ phối đồ mỗi ngày.", 890000, 990000.0, "photo-1591047139829-d91aecb6caea", false, 12),
                    product("dam-lua", "Đầm lụa Sớm Mai", "Váy", "Đầm midi mềm rũ, thiết kế thanh lịch, phù hợp đi làm và dạo phố.", 429000, null, "photo-1627225924765-552d49cf47ad", false, 22),
                    product("ao-polo-xanh", "Áo Polo Thảnh Thơi", "Áo thun", "Piqué cotton thoáng mát, cổ áo tinh gọn, mặc đẹp từ sáng đến tối.", 429000, null, "photo-1627225924765-552d49cf47ad", false, 22),
                    product("quan-short-kaki", "Quần short Kaki", "Quần", "Kaki mềm, cạp thoải mái và túi sâu tiện dụng.", 389000, null, "photo-1591195853828-11db59a44f6b", false, 20),
                    product("chan-vay-midi", "Chân váy Midi", "Váy", "Chân váy dáng chữ A nhẹ nhàng, phù hợp nhiều dịp.", 519000, 590000.0, "photo-1583496661160-fb5886a0aaaa", false, 11),
                    product("ao-len-mong", "Áo len mỏng Dịu", "Áo thun", "Len cotton mịn nhẹ, lớp áo lý tưởng cho những ngày se lạnh.", 590000, null, "photo-1576566588028-4147f3842f27", false, 13),
                    product("tui-vai-moc", "Túi vải Mộc", "Phụ kiện", "Túi vải canvas dày dặn, điểm nhấn nhỏ cho outfit thường ngày.", 219000, null, "photo-1544816155-12df9643f363", true, 35)
            ));
        };
    }

    @Bean
    CommandLineRunner seedAdmin(UserRepository users, PasswordEncoder passwordEncoder,
                                @Value("${app.admin.email:}") String email,
                                @Value("${app.admin.password:}") String password,
                                @Value("${app.admin.name:Quản trị viên}") String name) {
        return args -> {
            if (email.isBlank() && password.isBlank()) return;
            if (email.isBlank() || password.isBlank() || password.length() < 12) {
                throw new IllegalStateException("Cần cấu hình cả ADMIN_EMAIL và ADMIN_PASSWORD (ít nhất 12 ký tự).");
            }
            var existingAdmin = users.findByEmailIgnoreCase(email);
            if (existingAdmin.isEmpty()) {
                users.save(new StoreUser(name, email, passwordEncoder.encode(password), "ADMIN"));
            } else if (!"ADMIN".equals(existingAdmin.get().getRole())) {
                throw new IllegalStateException(
                        "ADMIN_EMAIL đã được tài khoản khách hàng sử dụng. Hãy cấu hình email quản trị khác.");
            }
        };
    }

    private Product product(String id, String name, String category, String description, double price,
                            Double oldPrice, String photo, boolean featured, int stock) {
        return new Product(id, name, category, description, price, oldPrice,
                "https://images.unsplash.com/" + photo + "?auto=format&fit=crop&w=900&q=85",
                List.of("S", "M", "L", "XL"), List.of("Kem", "Nâu", "Đen"),
                featured, stock);
    }
}
