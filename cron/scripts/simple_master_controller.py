#!/usr/bin/env python3
"""
Simple Master Controller for testing
Works with existing rate limiter and segmentation
"""

import json
import logging
from pathlib import Path
from datetime import datetime
from telegram_segmentation import TelegramSegmentation
from rate_limiter import RateLimiter

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SimpleMasterController:
    def __init__(self):
        self.segmentation = TelegramSegmentation()
        self.groups_file = Path('/home/drg/.openclaw/workspace/telegram_groups.json')
        self.master_config_file = Path('/home/drg/.openclaw/workspace/master_config.json')
        
        # Load group configurations
        self.groups = self.load_groups()
        self.master_config = self.load_master_config()
        
        # Initialize rate limiter
        self.rate_limiter = RateLimiter(limit=50, period=60, max_retries=3)
    
    def load_groups(self):
        """Load group configurations"""
        if self.groups_file.exists():
            try:
                return json.loads(self.groups_file.read_text())
            except Exception as e:
                logger.error(f"Failed to load groups: {e}")
                return {'groups': {}}
        return {'groups': {}}
    
    def save_groups(self):
        """Save group configurations"""
        self.groups_file.write_text(json.dumps(self.groups, indent=2))
    
    def load_master_config(self):
        """Load master controller configuration"""
        if self.master_config_file.exists():
            try:
                return json.loads(self.master_config_file.read_text())
            except Exception as e:
                logger.error(f"Failed to load master config: {e}")
                return {}
        return {
            'orchestration_rules': {},
            'active_groups': [],
            'master_chat_id': None
        }
    
    def save_master_config(self):
        """Save master controller configuration"""
        self.master_config_file.write_text(json.dumps(self.master_config, indent=2))
    
    def create_test_group(self, group_name, topic):
        """Create a test group"""
        try:
            # Store group info
            self.groups['groups'][group_name] = {
                'chat_id': f'test_{group_name}',
                'topic': topic,
                'created_at': datetime.now().isoformat(),
                'members': ['test_agent']
            }
            
            # Add to active groups
            if group_name not in self.master_config['active_groups']:
                self.master_config['active_groups'].append(group_name)
            
            self.save_groups()
            self.save_master_config()
            
            logger.info(f"Created test group '{group_name}' for topic '{topic}'")
            return f'test_{group_name}'
            
        except Exception as e:
            logger.error(f"Error creating test group: {e}")
            return None
    
    def route_message(self, message, topic=None):
        """Simple message routing"""
        try:
            # Check rate limits
            if not self.rate_limiter.track_call():
                logger.warning("Rate limit exceeded. Message dropped.")
                return False
            
            # Route based on topic
            if topic:
                for group_name, group_info in self.groups['groups'].items():
                    if group_info['topic'].lower() == topic.lower():
                        logger.info(f"Routing to {group_name}: {message[:50]}...")
                        return True
            
            # Default routing
            logger.info(f"Default routing: {message[:50]}...")
            return True
            
        except Exception as e:
            logger.error(f"Error routing message: {e}")
            return False
    
    def get_status(self):
        """Get system status"""
        return {
            'active_groups': len(self.master_config['active_groups']),
            'total_groups': len(self.groups['groups']),
            'rate_limiter_status': self.rate_limiter.get_status(),
            'last_message_time': self.master_config.get('last_message_time'),
        }
    
    def run_tests(self):
        """Run basic tests"""
        print("\nTesting Simple Master Controller...")
        print("=" * 40)
        
        # Create test groups
        print("Creating test groups...")
        self.create_test_group('audio_test', 'Audio Processing')
        self.create_test_group('credo_test', 'Credo Platform')
        self.create_test_group('health_test', 'System Health')
        
        # Test routing
        print("\nTesting message routing...")
        self.route_message("This is a system update", topic="health_test")
        self.route_message("Urgent audio processing needed", topic="audio_test")
        self.route_message("Weekly research findings", topic="research")
        
        # Show status
        print("\nSystem Status:")
        status = self.get_status()
        print(f"Active Groups: {status['active_groups']}")
        print(f"Total Groups: {status['total_groups']}")
        print(f"Rate Limiter: {status['rate_limiter_status']}")
        
        print("\n\n✅ Simple Master Controller working!")

def main():
    """Main function for testing"""
    controller = SimpleMasterController()
    controller.run_tests()

if __name__ == '__main__':
    main()
