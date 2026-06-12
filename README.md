# Collaborative API Development & Testing Platform

A full-stack platform for collaborative API development, testing, execution, and version management. The system enables teams to organize API requests, execute them through a centralized backend, track execution history, and maintain version control for API definitions.

## Overview

This project is inspired by modern API tools such as Postman but focuses on team collaboration, backend-driven request execution, and version control of API request definitions.

Instead of storing application source code, the platform stores and manages API request configurations, including endpoints, methods, headers, parameters, and request bodies.

The goal is to simulate a real-world software product while applying scalable backend architecture, clean code practices, and modern system design principles.

## Key Features

### Authentication & Authorization

* User registration and login
* JWT-based authentication
* Role-based access control

### Workspace Management

* Create and manage workspaces
* Invite and manage team members
* Collaborative API management

### API Collections

* Organize APIs into collections
* Folder-like structure for better management
* Easy navigation and grouping

### Request Builder

* Support for GET, POST, PUT, PATCH, DELETE requests
* URL configuration
* Headers management
* Query parameters
* Request body support

### API Execution Engine

* Centralized backend execution of API requests
* Secure request handling
* Response storage and retrieval
* Request execution monitoring

### Execution History

* Store all API executions
* Track request and response data
* Maintain audit trail of API usage

### Version Control System

* Automatic version creation on API updates
* View historical versions
* Compare API definition changes
* Rollback to previous versions
* Version metadata and change tracking

### Environment Variables

* Development environment support
* Staging environment support
* Production environment support
* Variable substitution during execution

## System Architecture

The platform follows a layered architecture:

* Presentation Layer (REST APIs)
* Service Layer (Business Logic)
* Repository Layer (Data Access)
* PostgreSQL Database
* React Frontend
* API Execution Engine

## Technology Stack

### Backend

* Java
* Spring Boot
* Spring Web
* Spring Data JPA
* Hibernate
* JWT Authentication

### Database

* PostgreSQL

### Frontend

* React
* Axios

### Testing

* JUnit
* Mockito

## Core Entities

### User

Represents platform users and authentication details.

### Workspace

Collaborative space where teams manage APIs.

### Workspace Member

Handles workspace roles and permissions.

### Collection

Groups related API definitions.

### Endpoint

Stores API request definitions.

### Endpoint Version

Maintains historical versions of API definitions.

### Environment

Stores environment-specific variables.

### Execution History

Stores request execution details and responses.

## Versioning Workflow

1. User creates an API definition.
2. Any modification creates a new version.
3. Previous versions remain immutable.
4. Users can compare versions.
5. Users can rollback to any previous version.
6. Rollback creates a new version entry for traceability.

## Future Enhancements

* API analytics dashboard
* Response time metrics
* Smart API recommendations
* Request caching
* Rate limiting
* Real-time notifications
* Activity feeds
* Advanced workspace permissions

## Learning Objectives

This project focuses on:

* Spring Boot development
* Clean architecture
* REST API design
* Database design
* Authentication & authorization
* Version control systems
* System design concepts
* Team collaboration workflows
* Full-stack application development

## Project Status

🚧 Active Development

Current focus:

* Authentication & authorization
* Workspace management
* Collections & endpoints
* API execution engine
* Versioning system

## Contributors

Built as a learning-focused full-stack project to explore scalable backend engineering, API management systems, and collaborative software development.
