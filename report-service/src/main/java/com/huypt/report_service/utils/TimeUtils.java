package com.huypt.report_service.utils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class TimeUtils {

    public static TimeRange today(){
        return new TimeRange(
                LocalDate.now().atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX)
        );
    }

    public static TimeRange thisWeek(){
        return new TimeRange(
                LocalDate.now().with(DayOfWeek.MONDAY).atStartOfDay(),
                LocalDateTime.now().with(DayOfWeek.SUNDAY).toLocalDate().atTime(LocalTime.MAX)
        );
    }


    public static TimeRange thisMonth(){
        LocalDate now = LocalDate.now();
        return new TimeRange(
                now.withDayOfMonth(1).atStartOfDay(),
                now.withDayOfMonth(now.lengthOfMonth()).atTime(LocalTime.MAX)
        );
    }
}
