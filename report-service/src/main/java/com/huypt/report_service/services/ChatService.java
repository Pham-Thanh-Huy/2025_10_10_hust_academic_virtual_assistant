package com.huypt.report_service.services;


import com.huypt.report_service.dtos.BaseResponse;
import com.huypt.report_service.dtos.responses.ChatResponse;
import com.huypt.report_service.repositories.mongo.ChatMessageRepository;
import com.huypt.report_service.repositories.mongo.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final MongoTemplate mongoTemplate;

    public BaseResponse<Page<ChatResponse>> listChat(String username, String model, String status,
                                                     LocalDateTime start, LocalDateTime end, Pageable pageable) {
        try {
            List<AggregationOperation> operations = new ArrayList<>();
            operations.add(
                    Aggregation.lookup("ChatSession", "sessionId", "_id", "session")
            );

            operations.add(
                    Aggregation.unwind("session")
            );
            operations.add(
                    Aggregation.project()
                            // ChatMessage
                            .and("_id").as("id")
                            .and("sessionId").as("sessionId")
                            .and("message").as("message")
                            .and("answer").as("answer")
                            .and("voiceAnswer").as("voiceAnswer")
                            .and("model").as("model")
                            .and("sequence").as("sequence")
                            .and("chatAt").as("chatAt")

                            // ChatSession
                            .and("session.title").as("title")
                            .and("session.status").as("status")
                            .and("session.username").as("username")
            );

            List<Criteria> query = new ArrayList<>();
            if (!ObjectUtils.isEmpty(username)) {
                query.add(Criteria.where("username").regex(username, "i"));
            }

            if (!ObjectUtils.isEmpty(model)) {
                query.add(Criteria.where("model").regex(model, "i"));
            }

            if (!ObjectUtils.isEmpty(status)) {
                query.add(Criteria.where("status").regex(status, "i"));
            }

            if (!ObjectUtils.isEmpty(start) && !ObjectUtils.isEmpty(end)) {
                query.add(Criteria.where("chatAt").gte(start).lte(end));
            } else if (!ObjectUtils.isEmpty(start) && ObjectUtils.isEmpty(end)) {
                query.add(Criteria.where("chatAt").gte(start));
            } else if (ObjectUtils.isEmpty(start) && !ObjectUtils.isEmpty(end)) {
                query.add(Criteria.where("chatAt").lte(end));
            }


            if(!query.isEmpty()){
                operations.add(
                        Aggregation.match(
                                new Criteria().andOperator(query.toArray(Criteria[]::new))
                        )
                );
            }

            if(pageable.getSort().isSorted()){
                operations.add(
                        Aggregation.sort(pageable.getSort())
                );
            }

            operations.add(
                    Aggregation.skip(pageable.getOffset())
            );

            operations.add(
                    Aggregation.limit(pageable.getPageSize())
            );

            Aggregation aggregation = Aggregation.newAggregation(operations);
            List<ChatResponse> result = mongoTemplate.aggregate(aggregation, "ChatMessage", ChatResponse.class).getMappedResults();

            // Trong danh sách ẩn đi dữ liệu câu trả lời chỉ show câu hỏi thôi
            result.forEach(v -> {v.setAnswer(null); v.setTitle(null);});
            Page<ChatResponse> responses = new PageImpl<>(result, pageable, result.size());

            return BaseResponse.makeSuccessResponse(responses);
        } catch (Exception e) {
            log.error("[ERROR-WHEN-LIST-CHAT] ", e);
            return BaseResponse.makeInternalServerError(e.getMessage());
        }
    }

}
