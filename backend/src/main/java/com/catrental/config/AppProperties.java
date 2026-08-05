package com.catrental.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Geofence geofence = new Geofence();
    private final AiService aiService = new AiService();
    private final Device device = new Device();
    private final Cors cors = new Cors();
    private final Alerts alerts = new Alerts();

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private long expirationMs;
    }

    @Getter
    @Setter
    public static class Geofence {
        private double radiusKm;
    }

    @Getter
    @Setter
    public static class AiService {
        private String baseUrl;
        private String sharedSecret;
    }

    @Getter
    @Setter
    public static class Device {
        private String apiKey;
    }

    @Getter
    @Setter
    public static class Cors {
        private String allowedOrigins;
    }

    @Getter
    @Setter
    public static class Alerts {
        private double healthThreshold;
        private int maintenanceIntervalDays;
        private long checkIntervalMs;
    }
}
