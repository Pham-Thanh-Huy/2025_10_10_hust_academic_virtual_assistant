package com.huypt.report_service.repositories.mongo;

import com.huypt.report_service.entities.mongo.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    ChatMessage findFirstBySessionIdOrderByChatAtAsc(String sessionId);

    ChatMessage findFirstBySessionIdOrderByChatAtDesc(String sessionId);

    Page<ChatMessage> findBySessionId(String sessionId, Pageable pageable);


    long countByChatAtBetween(LocalDateTime start, LocalDateTime end);

    List<ChatMessage> findByChatAtBetween(LocalDateTime start, LocalDateTime end);

    List<ChatMessage> findTop4ByOrderByChatAtDesc();
}
