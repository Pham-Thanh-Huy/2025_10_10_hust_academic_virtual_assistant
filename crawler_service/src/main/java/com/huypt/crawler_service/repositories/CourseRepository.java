package com.huypt.crawler_service.repositories;

import com.huypt.crawler_service.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {

    @Query("SELECT c FROM Course c WHERE c.code = :code")
    Course existsByCode(String code);
}
