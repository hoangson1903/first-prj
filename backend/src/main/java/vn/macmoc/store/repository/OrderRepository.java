package vn.macmoc.store.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import vn.macmoc.store.model.Order;

public interface OrderRepository extends MongoRepository<Order, String> {}
