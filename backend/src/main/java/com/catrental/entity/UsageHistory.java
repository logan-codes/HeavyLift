package com.catrental.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "usage_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id")
    private Operator operator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private Status status;

    @Column(name = "fuel_gauge", precision = 5, scale = 2)
    private BigDecimal fuelGauge;

    @Column(name = "health", precision = 5, scale = 2)
    private BigDecimal health;

    // ── ML diagnostic telemetry ──────────────────────────────────────────
    @Column(name = "engine_hours", precision = 10, scale = 2)
    private BigDecimal engineHours;

    @Column(name = "metric_1", precision = 10, scale = 4)
    private BigDecimal metric1;

    @Column(name = "metric_2", precision = 10, scale = 4)
    private BigDecimal metric2;

    @Column(name = "metric_3", precision = 10, scale = 4)
    private BigDecimal metric3;

    @Column(name = "metric_4", precision = 10, scale = 4)
    private BigDecimal metric4;

    @Column(name = "metric_5", precision = 10, scale = 4)
    private BigDecimal metric5;

    @Column(name = "metric_6", precision = 10, scale = 4)
    private BigDecimal metric6;

    @Column(name = "metric_7", precision = 10, scale = 4)
    private BigDecimal metric7;

    @Column(name = "metric_8", precision = 10, scale = 4)
    private BigDecimal metric8;
}
