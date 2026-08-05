package com.catrental.service;

import com.catrental.dto.CreateCustomerRequest;
import com.catrental.dto.CustomerDto;
import com.catrental.entity.Customer;
import com.catrental.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<CustomerDto> list() {
        return customerRepository.findAll().stream().map(this::toDto).toList();
    }

    public CustomerDto create(CreateCustomerRequest request) {
        LocalDateTime now = LocalDateTime.now();
        Customer customer = Customer.builder()
                .name(request.name())
                .contactPerson(request.contactPerson())
                .phone(request.phone())
                .email(request.email())
                .address(request.address())
                .isActive(true)
                .createdAt(now)
                .editedOn(now)
                .build();
        return toDto(customerRepository.save(customer));
    }

    private CustomerDto toDto(Customer c) {
        return new CustomerDto(c.getCustomerId(), c.getName(), c.getContactPerson(), c.getPhone(),
                c.getEmail(), c.getAddress(), c.getIsActive());
    }
}
