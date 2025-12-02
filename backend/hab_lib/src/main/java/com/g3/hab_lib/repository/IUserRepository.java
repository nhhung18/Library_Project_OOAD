package com.g3.hab_lib.repository;

import com.g3.hab_lib.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


public interface IUserRepository extends JpaRepository<User, Integer> {
    @Query(
            value = "SELECT u.*, r.role_name FROM users u\n" +
                    "INNER JOIN roles r ON u.role_id = r.id\n" +
                    "WHERE r.role_name = 'GUEST' OR r.role_name = 'READER'",
            nativeQuery = true
    )
    Page<User> findAllCustomer(Pageable pageable);

    @Query(
            value = "SELECT users.*, roles.role_name FROM users\n" +
                    "INNER JOIN roles ON users.role_id = roles.id\n" +
                    "WHERE role_name = 'STAFF' or role_name = 'ADMIN'",
            nativeQuery = true
    )
    Page<User> findAllStaff(Pageable pageable);
}
