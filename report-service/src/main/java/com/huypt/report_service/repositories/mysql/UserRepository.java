package com.huypt.report_service.repositories.mysql;

import com.huypt.report_service.entities.mysql.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);

    @Query(
            value = """
                        SELECT COUNT(DISTINCT u.id)
                        FROM user u
                        JOIN user_role ur ON u.id = ur.user_id
                        JOIN role r ON ur.role_id = r.id
                        WHERE r.name = :role
                    """,
            nativeQuery = true
    )
    Long countByRole(@Param("role") String role);


    @EntityGraph(attributePaths = "profile")
    List<User> findByUsernameIn(Collection<String> usernames);
}
