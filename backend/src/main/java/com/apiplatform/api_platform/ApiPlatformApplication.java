package com.apiplatform.api_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ApiPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiPlatformApplication.class, args);
	}

}
