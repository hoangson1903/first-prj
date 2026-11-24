package vn.macmoc.store.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import vn.macmoc.store.model.Product;

public interface ProductRepository extends MongoRepository<Product, String> {}
