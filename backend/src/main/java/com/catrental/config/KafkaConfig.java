package com.catrental.config;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.util.backoff.FixedBackOff;

/**
 * Activates {@code @KafkaListener} processing and configures a resilient container factory.
 * <p>
 * The {@link DefaultErrorHandler} retries failed messages twice (500 ms apart) before
 * logging and skipping them, so a single malformed prediction event never kills the consumer.
 */
@Configuration
@EnableKafka
public class KafkaConfig {

    private static final Logger log = LoggerFactory.getLogger(KafkaConfig.class);

    @Bean
    public ConcurrentKafkaListenerContainerFactory<Object, Object> kafkaListenerContainerFactory(
            ConsumerFactory<Object, Object> consumerFactory) {

        var factory = new ConcurrentKafkaListenerContainerFactory<Object, Object>();
        factory.setConsumerFactory(consumerFactory);

        // Retry twice (500 ms gap), then log and skip the offending record.
        DefaultErrorHandler errorHandler = new DefaultErrorHandler(
                (ConsumerRecord<?, ?> record, Exception ex) ->
                        log.error("Kafka message permanently failed after retries — skipping. "
                                + "topic={} partition={} offset={} key={} error={}",
                                record.topic(), record.partition(), record.offset(),
                                record.key(), ex.getMessage()),
                new FixedBackOff(500L, 2L)
        );
        factory.setCommonErrorHandler(errorHandler);

        return factory;
    }
}
