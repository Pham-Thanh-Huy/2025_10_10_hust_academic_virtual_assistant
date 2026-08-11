package com.huypt.report_service.controller;

import com.huypt.report_service.dtos.BaseResponse;
import com.huypt.report_service.entities.mysql.Course;
import com.huypt.report_service.services.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/course")
public class CourseController {
    private final CourseService courseService;

    @GetMapping("/list")
    public ResponseEntity<BaseResponse<Page<Course>>> listCourse(@RequestParam(required = false) String code,
                                                                 @RequestParam(required = false) String name,
                                                                 @RequestParam(required = false) String englishName,
                                                                 Pageable pageable){
        BaseResponse<Page<Course>> response = courseService.listCourse(code, name, englishName, pageable);
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(response.getMessage().getStatus()));
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<BaseResponse<Course>> listCourse(@PathVariable Integer id){
        BaseResponse<Course> response = courseService.getDetailCourse(id);
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(response.getMessage().getStatus()));
    }
}
