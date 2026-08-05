package com.catrental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CatRentalApplication {
    public static void main(String[] args) {
        SpringApplication.run(CatRentalApplication.class, args);
    }
}
