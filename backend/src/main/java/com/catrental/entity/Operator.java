package com.catrental.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "operator")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Operator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "operator_id")
    private Integer operatorId;

    @Column(name = "operator_name", length = 150)
    private String operatorName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "license_number", length = 100)
    private String licenseNumber;

    @Column(name = "license_validity")
    private LocalDate licenseValidity;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "created_on", nullable = false)
    private LocalDateTime createdOn;

    @Column(name = "edited_on", nullable = false)
    private LocalDateTime editedOn;
}
