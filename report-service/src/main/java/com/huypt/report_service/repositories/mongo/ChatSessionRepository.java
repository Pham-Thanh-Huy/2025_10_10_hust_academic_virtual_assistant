package com.huypt.report_service.repositories.mongo;

import com.huypt.report_service.entities.mongo.ChatSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends MongoRepository<ChatSession, String> {

    List<ChatSession> findByUsernameOrderByLastMessageAtDesc(String username);

    ChatSession findByIdAndUsername(String id, String username);
}
