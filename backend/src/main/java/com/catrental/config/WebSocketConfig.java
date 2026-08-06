package com.catrental.config;

import com.catrental.security.JwtHandshakeInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/** Live push replacement for dashboard polling: equipment/alert/prediction updates go out
 * over STOMP topics as soon as they happen, instead of the frontend polling REST every 5-15s. */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;
    private final AppProperties appProperties;

    public WebSocketConfig(JwtHandshakeInterceptor jwtHandshakeInterceptor, AppProperties appProperties) {
        this.jwtHandshakeInterceptor = jwtHandshakeInterceptor;
        this.appProperties = appProperties;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .addInterceptors(jwtHandshakeInterceptor)
                .setAllowedOrigins(appProperties.getCors().getAllowedOrigins().split(","));
    }
}
