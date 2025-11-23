package com.huypt.crawler_service.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.Objects;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name; // Tên học phần

    @Column(name = "english_name")
    private String englishName; // Tên học phần tiếng anh

    private String code; // Mã học phần

    private String duration; // Thời lượng

    private String credits; // Số tín chỉ

    @Column(name = "credit_fee")
    private String creditFee; // TC học phí

    private String weight; // trọng số

    @Column(name = "list_course_condtion")
    private String listCourseCondition; // Danh sách học phần điều kiện

    @Column(name = "instituteManage")
    private String instituteManage; // Viện quản lý


    // Custom equals not check id
    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Course course = (Course) o;
        return Objects.equals(name, course.name)
                && Objects.equals(code, course.code)
                && Objects.equals(englishName, course.englishName)
                && Objects.equals(duration, course.duration)
                && Objects.equals(credits, course.credits)
                && Objects.equals(creditFee, course.creditFee)
                && Objects.equals(weight, course.weight)
                && Objects.equals(listCourseCondition, course.listCourseCondition)
                && Objects.equals(instituteManage, course.instituteManage);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, englishName, code, duration, credits, creditFee, weight, listCourseCondition, instituteManage);
    }
}
