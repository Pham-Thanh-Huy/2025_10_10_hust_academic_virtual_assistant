package com.huypt.report_service.repositories.mysql;

import com.huypt.report_service.entities.mysql.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {

    @Query("SELECT c FROM Course c WHERE c.code = :code")
    Course existsByCode(String code);


    @Query("""
            SELECT c
            FROM Course c
            WHERE (:code IS NULL OR c.code = :code)
            AND (:name IS NULL OR c.name = :name)
            AND (:englishName IS NULL OR c.englishName = :englishName)
            """)
    Page<Course> filter(String code, String name, String englishName, Pageable pageable);

}