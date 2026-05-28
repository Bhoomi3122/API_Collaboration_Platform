package com.apiplatform.api_platform.workspace.exception;

public class WorkspaceNotFoundException extends RuntimeException{
    public WorkspaceNotFoundException(String message)
    {
        super(message);
    }
}
