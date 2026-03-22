#!/usr/bin/env python3
"""
Advanced Rate Limiter with Resume Capability
Handles API rate limits and can resume operations
where they left off.
"""

import time
import json
import os
import logging
from pathlib import Path
from datetime import datetime, timedelta

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self, limit=100, period=60, max_retries=3):
        self.limit = limit
        self.period = period
        self.max_retries = max_retries
        self.calls = []
        self.state_file = Path('/home/drg/.openclaw/workspace/cron/logs/rate_limiter_state.json')
        self.retry_delay = 5  # Initial retry delay in seconds
        
        # Load previous state if exists
        self.load_state()
    
    def load_state(self):
        """Load previous state from file"""
        if self.state_file.exists():
            try:
                state = json.loads(self.state_file.read_text())
                self.calls = state.get('calls', [])
                self.retry_delay = state.get('retry_delay', 5)
                logger.info(f"Loaded rate limiter state: {len(self.calls)} calls")
            except Exception as e:
                logger.error(f"Failed to load state: {e}")
    
    def save_state(self):
        """Save current state to file"""
        state = {
            'calls': self.calls,
            'retry_delay': self.retry_delay,
            'timestamp': datetime.now().isoformat()
        }
        self.state_file.write_text(json.dumps(state, indent=2))
    
    def track_call(self):
        """Track API call and handle rate limiting"""
        now = time.time()
        
        # Clean up old calls
        self.calls = [t for t in self.calls if t > now - self.period]
        
        # Check if we're over the limit
        if len(self.calls) >= self.limit:
            logger.warning("Rate limit exceeded. Pausing operations.")
            return False
            
        # Add current call
        self.calls.append(now)
        self.save_state()
        return True
    
    def wait_if_needed(self):
        """Wait if rate limit is about to be exceeded"""
        now = time.time()
        self.calls = [t for t in self.calls if t > now - self.period]
        
        if len(self.calls) >= self.limit:
            # Calculate how long to wait
            oldest = self.calls[0]
            wait_time = (oldest + self.period) - now
            
            if wait_time > 0:
                logger.info(f"Rate limit hit. Waiting {wait_time:.1f} seconds...")
                time.sleep(wait_time)
                
                # Update calls after waiting
                self.calls = [t for t in self.calls if t > now - self.period]
    
    def execute_with_retry(self, func, *args, **kwargs):
        """Execute function with rate limiting and retry logic"""
        retries = 0
        
        while retries < self.max_retries:
            # Wait if needed
            self.wait_if_needed()
            
            try:
                # Track this call
                if not self.track_call():
                    # Rate limit hit, wait and retry
                    time.sleep(self.retry_delay)
                    self.retry_delay *= 2  # Exponential backoff
                    retries += 1
                    continue
                
                # Execute the function
                result = func(*args, **kwargs)
                
                # Reset retry delay on success
                self.retry_delay = 5
                return result
                
            except Exception as e:
                logger.error(f"Error executing function: {e}")
                retries += 1
                time.sleep(self.retry_delay)
                self.retry_delay *= 2
        
        logger.error(f"Max retries ({self.max_retries}) exceeded")
        return None
    
    def get_remaining_calls(self):
        """Get number of remaining calls in current period"""
        now = time.time()
        self.calls = [t for t in self.calls if t > now - self.period]
        return max(0, self.limit - len(self.calls))
    
    def get_next_available_time(self):
        """Get when next call will be available"""
        now = time.time()
        self.calls = [t for t in self.calls if t > now - self.period]
        
        if len(self.calls) < self.limit:
            return now
        else:
            oldest = self.calls[0]
            return oldest + self.period
    
    def reset(self):
        """Reset rate limiter state"""
        self.calls = []
        self.retry_delay = 5
        self.save_state()
        logger.info("Rate limiter reset")

class RateLimitedExecutor:
    def __init__(self, limiter):
        self.limiter = limiter
        self.task_queue = []
        self.current_task = None
        self.paused = False
        self.pause_reason = None
    
    def add_task(self, task_id, func, *args, **kwargs):
        """Add a task to the queue"""
        task = {
            'id': task_id,
            'func': func,
            'args': args,
            'kwargs': kwargs,
            'retries': 0,
            'status': 'pending',
            'created_at': time.time()
        }
        self.task_queue.append(task)
        logger.info(f"Task {task_id} added to queue")
    
    def execute_next(self):
        """Execute the next task in the queue"""
        if self.paused or not self.task_queue:
            return False
        
        # Get next task
        task = self.task_queue.pop(0)
        self.current_task = task
        
        try:
            # Execute with rate limiting
            result = self.limiter.execute_with_retry(task['func'], *task['args'], *task['kwargs'])
            
            if result is not None:
                task['status'] = 'completed'
                logger.info(f"Task {task['id']} completed successfully")
                return True
            else:
                task['status'] = 'failed'
                logger.error(f"Task {task['id']} failed after retries")
                return False
                
        except Exception as e:
            task['status'] = 'error'
            task['error'] = str(e)
            logger.error(f"Task {task['id']} failed with error: {e}")
            
            # Retry if applicable
            if task['retries'] < 3:
                task['retries'] += 1
                self.task_queue.insert(0, task)  # Re-add to front of queue
                logger.info(f"Task {task['id']} will be retried (attempt {task['retries']}/3)")
            else:
                logger.error(f"Task {task['id']} failed after 3 retries")
                
            return False
    
    def pause(self, reason=None):
        """Pause execution"""
        self.paused = True
        self.pause_reason = reason
        logger.info(f"Execution paused: {reason}")
    
    def resume(self):
        """Resume execution"""
        self.paused = False
        self.pause_reason = None
        logger.info("Execution resumed")
    
    def get_status(self):
        """Get current status"""
        return {
            'paused': self.paused,
            'pause_reason': self.pause_reason,
            'current_task': self.current_task['id'] if self.current_task else None,
            'queue_length': len(self.task_queue),
            'remaining_calls': self.limiter.get_remaining_calls()
        }

# Example usage
if __name__ == '__main__':
    # Create rate limiter
    limiter = RateLimiter(limit=100, period=60)
    executor = RateLimitedExecutor(limiter)
    
    # Example API call function
    def example_api_call(data):
        # Simulate API call
        if data == 'fail_once':
            if not hasattr(example_api_call, 'fail_count'):
                example_api_call.fail_count = 0
            example_api_call.fail_count += 1
            if example_api_call.fail_count == 1:
                raise Exception("Simulated API failure")
        
        logger.info(f"API call successful with data: {data}")
        return f"Result for {data}"
    
    # Add tasks
    executor.add_task('task_1', example_api_call, 'data_1')
    executor.add_task('task_2', example_api_call, 'data_2')
    executor.add_task('task_3', example_api_call, 'fail_once')
    executor.add_task('task_4', example_api_call, 'data_4')
    
    # Execute tasks
    while executor.task_queue:
        executor.execute_next()
        time.sleep(1)  # Simulate delay between tasks
    
    logger.info("All tasks processed")
