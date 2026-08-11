package com.huypt.report_service.services;

import com.huypt.report_service.dtos.BaseResponse;
import com.huypt.report_service.entities.mysql.Course;
import com.huypt.report_service.repositories.mysql.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {
    private final CourseRepository courseRepository;

    public BaseResponse<Page<Course>> listCourse(String code, String name, String englishName, Pageable pageable) {
        try {
            Page<Course> listCourse = courseRepository.filter(code, name, englishName, pageable);
            return BaseResponse.makeSuccessResponse(listCourse);
        } catch (Exception e) {
            log.error("[ERROR-WHEN-LIST-COURSE] {}", e.getMessage());
            return BaseResponse.makeInternalServerError(e.getMessage());
        }
    }


    public BaseResponse<Course> getDetailCourse(Integer id) {
        try {
            Course course = courseRepository.findById(id).orElse(null);
            if (ObjectUtils.isEmpty(course)) {
                return BaseResponse.makeBadRequestResponse("Không tồn tại course với id này");
            }

            return BaseResponse.makeSuccessResponse(course);
        } catch (Exception e) {
            log.error("[ERROR-WHEN-DETAIL-COURSE] {}", e.getMessage());
            return BaseResponse.makeInternalServerError(e.getMessage());
        }
    }


}