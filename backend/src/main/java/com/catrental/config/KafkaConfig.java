package com.catrental.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;

/** Activates {@code @KafkaListener} processing; producer/consumer factories are Spring Boot's
 * autoconfigured defaults, driven entirely by the {@code spring.kafka.*} properties in application.yml. */
@Configuration
@EnableKafka
public class KafkaConfig {
}
