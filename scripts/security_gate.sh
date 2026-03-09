#!/bin/bash
# Security Gate - Phase 1 MVP
# Sanitize inputs and detect potential injection attempts

WORKSPACE="/home/drg/.openclaw/workspace"
LOG_FILE="$WORKSPACE/.security_log"

log_attempt() {
    echo "[$(date +%Y-%m-%d\ %H:%M:%S)] SECURITY: $1" >> $LOG_FILE
}

# Check for common injection patterns in input
check_input() {
    local input="$1"
    
    # Command injection patterns
    if echo "$input" | grep -E '(;|\||&&|\$\(|`)' >/dev/null 2>&1; then
        log_attempt "Potential command injection detected"
        return 1
    fi
    
    # Path traversal
    if echo "$input" | grep -E "(\.\./|\.\.\\)" >/dev/null 2>&1; then
        log_attempt "Potential path traversal detected"
        return 1
    fi
    
    # Prompt injection
    if echo "$input" | grep -iE "(ignore previous|forget|system prompt|you are now)" >/dev/null 2>&1; then
        log_attempt "Potential prompt injection detected"
        return 1
    fi
    
    # SQL injection patterns
    if echo "$input" | grep -iE "(union.*select|insert into|drop table|' or '1'|' or '0)" >/dev/null 2>&1; then
        log_attempt "Potential SQL injection detected"
        return 1
    fi
    
    return 0
}

# If called with argument, check it
if [ -n "$1" ]; then
    if check_input "$1"; then
        echo "PASS"
        exit 0
    else
        echo "BLOCK"
        exit 1
    fi
fi
