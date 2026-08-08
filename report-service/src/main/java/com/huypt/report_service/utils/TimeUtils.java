package com.huypt.report_service.utils;


import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;

public class TimeUtils {

    private static final ZoneId VIETNAM_ZONE =
            ZoneId.of("Asia/Ho_Chi_Minh");

    public static TimeRange today() {
        LocalDate today = LocalDate.now(VIETNAM_ZONE);

        return new TimeRange(
                today.atStartOfDay(),
                today.plusDays(1).atStartOfDay()
        );
    }

    public static TimeRange thisWeek() {
        LocalDate today = LocalDate.now(VIETNAM_ZONE);
        LocalDate monday = today.with(DayOfWeek.MONDAY);

        return new TimeRange(
                monday.atStartOfDay(),
                monday.plusWeeks(1).atStartOfDay()
        );
    }

    public static TimeRange thisMonth() {
        LocalDate today = LocalDate.now(VIETNAM_ZONE);
        LocalDate firstDay = today.withDayOfMonth(1);

        return new TimeRange(
                firstDay.atStartOfDay(),
                firstDay.plusMonths(1).atStartOfDay()
        );
    }


    public static TimeRange thisYear(){
        LocalDate today = LocalDate.now(VIETNAM_ZONE);
        return new TimeRange(
                today.withDayOfYear(1).atStartOfDay(),
                today.withDayOfYear(1).plusYears(1).atStartOfDay()
        );
    }
}