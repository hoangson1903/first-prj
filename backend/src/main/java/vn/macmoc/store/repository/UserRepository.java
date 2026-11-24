package vn.macmoc.store.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import vn.macmoc.store.model.StoreUser;

public interface UserRepository extends MongoRepository<StoreUser, String> {
    Optional<StoreUser> findByEmailIgnoreCase(String email);
    long countByRole(String role);
}
