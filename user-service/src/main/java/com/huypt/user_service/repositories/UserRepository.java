package com.huypt.user_service.repositories;

import com.huypt.user_service.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.username= :username")
    Optional<User> findByUsername(String username);


    User getByUsername(String username);
}
