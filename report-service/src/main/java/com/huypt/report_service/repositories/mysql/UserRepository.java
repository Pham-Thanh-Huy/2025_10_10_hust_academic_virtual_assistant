package com.huypt.report_service.repositories.mysql;

import com.huypt.report_service.entities.mysql.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
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


    @Query(value = """
            SELECT u.* FROM user u
            JOIN profile p ON u.id = p.user_id
            WHERE (:username IS NULL OR u.username LIKE %:username%)
            AND (:fullName IS NULL OR LOWER(CONCAT(p.last_name, ' ', p.first_name)) LIKE LOWER(CONCAT('%',:fullName,'%')))
            AND (:age IS NULL OR p.age = :age)
            AND (:start IS NULL OR p.birth_of_date >= :start)
            AND (:end IS NULL OR p.birth_of_date <= :end)
            """,
            countQuery = """
                    SELECT COUNT(*) FROM user u
                    JOIN profile p ON u.id = p.user_id
                    WHERE (:username IS NULL OR u.username LIKE %:username%)
                    AND (:fullname IS NULL OR LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%',:fullname,'%')))
                    AND (:age IS NULL OR p.age = :age)
                    AND (:start IS NULL OR p.birth_of_date >= :start)
                    AND (:end IS NULL OR p.birth_of_date <= :end)
                    """,
            nativeQuery = true)
    Page<User> filter(String username, String fullName, Integer age, LocalDate start, LocalDate end, Pageable pageable);


}
