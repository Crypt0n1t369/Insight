#!/usr/bin/env python3
"""
Natural Conversation Interview Bot
Adapted from the script - conversational, focused, adaptive
"""
import asyncio
import json
import os
from datetime import datetime
from pathlib import Path
from telegram import Bot
from telegram.error import TelegramError

TOKEN = '8392406833:AAFKG-m9_c4z-5GnEaRy9VFYqVFLIy-NnKU'

BASE = Path('/home/drg/.openclaw/workspace/memory/research/youth-empowerment-platform/validation')
STATE_FILE = BASE / 'interview_state.json'
LOG_FILE = BASE / 'interview_log.json'
LAST_UPDATE_FILE = BASE / 'last_update.json'

# Initialize files
if not STATE_FILE.exists():
    json.dump({}, open(STATE_FILE, 'w'))
if not LOG_FILE.exists():
    json.dump({'interviews': []}, open(LOG_FILE, 'w'))

class NaturalInterviewBot:
    def __init__(self):
        self.bot = Bot(token=TOKEN)
        self.state = json.load(open(STATE_FILE))
        self.log = json.load(open(LOG_FILE))
    
    async def check_messages(self):
        try:
            with open(LAST_UPDATE_FILE) as f:
                data = json.load(f)
                last_update_id = data.get('update_id', 0)
        except:
            last_update_id = 0
        
        updates = await self.bot.get_updates(offset=last_update_id + 1, limit=10)
        
        for u in updates:
            if u.message and u.message.text:
                chat_id = str(u.message.chat.id)
                text = u.message.text.strip()
                
                # Skip commands
                if text.startswith('/'):
                    text = text[1:]
                
                name = u.message.chat.first_name or "Hey"
                username = u.message.chat.username or "unknown"
                
                # Save update ID
                with open(LAST_UPDATE_FILE, 'w') as f:
                    json.dump({'update_id': u.update_id, 'last_check': datetime.now().isoformat()}, f)
                
                # Route message
                await self.route_message(chat_id, text, name, username)
    
    async def route_message(self, chat_id, text, name, username):
        current_state = self.state.get(chat_id, {})
        step = current_state.get('step', 0)
        data = current_state.get('data', {})
        
        text_lower = text.lower().strip()
        
        # START - New conversation
        if step == 0:
            # Any message is a "yes" - start naturally
            await self.bot.send_message(
                chat_id=chat_id,
                text=f"Hey {name}! 👋 Cool, thanks for chatting."
            )
            
            # Natural opening
            await self.bot.send_message(
                chat_id=chat_id,
                text="So I'm trying to understand something — what's been on your mind lately? Anything you keep thinking about but haven't figured out yet?"
            )
            
            self.state[chat_id] = {'step': 1, 'data': {'name': name, 'username': username, 'started_at': datetime.now().isoformat()}}
            self.save_state()
            return
        
        # STEP 1: Pain point response
        if step == 1:
            data['pain_point'] = text
            
            # Natural follow-up based on their answer
            if len(text) < 20:
                # Short answer - dig deeper
                await self.bot.send_message(
                    chat_id=chat_id,
                    text="Ah got it. Tell me more — what's held you back?"
                )
            else:
                # They shared something - acknowledge naturally
                await self.bot.send_message(
                    chat_id=chat_id,
                    text="That makes sense. So I've been thinking about this app idea — want your honest take?"
            )
            
            self.state[chat_id] = {'step': 2, 'data': data}
            self.save_state()
            return
        
        # STEP 2: Concept test
        if step == 2:
            # They might have answered the concept question already
            # Let's present it if they haven't
            data['concept_response'] = text
            
            await self.bot.send_message(
                chat_id=chat_id,
                text="Basically: an app where you have your own AI that gets to know you — what you're into, what you want, where you're at. It helps you figure things out and shows you opportunities when they come up. Private, encrypted, no real name needed.\n\nSound useful? Or no?"
            )
            
            self.state[chat_id] = {'step': 3, 'data': data}
            self.save_state()
            return
        
        # STEP 3: Concept reaction
        if step == 3:
            data['concept_useful'] = text
            
            # Probe for specifics
            if 'yes' in text_lower or 'useful' in text_lower or 'good' in text_lower:
                await self.bot.send_message(
                    chat_id=chat_id,
                    text="Nice. What part would be most useful to you?"
                )
            elif 'no' in text_lower or 'dumb' in text_lower or 'useless' in text_lower:
                await self.bot.send_message(
                    chat_id=chat_id,
                    text="Fair. What would make it better?"
                )
            else:
                await self.bot.send_message(
                    chat_id=chat_id,
                    text="Got it. What's your gut reaction — would you actually try something like that?"
            )
            
            self.state[chat_id] = {'step': 4, 'data': data}
            self.save_state()
            return
        
        # STEP 4: Deep dive - adapt based on conversation
        if step == 4:
            data['reaction'] = text
            
            # Ask about privacy
            await self.bot.send_message(
                chat_id=chat_id,
                text="One thing — how much do you care about apps seeing your data? Like 1-10, or do you not really think about it?"
            )
            
            self.state[chat_id] = {'step': 5, 'data': data}
            self.save_state()
            return
        
        # STEP 5: Privacy
        if step == 5:
            data['privacy'] = text
            
            await self.bot.send_message(
                chat_id=chat_id,
                text="And last question — honestly, 1-10, how likely are you to try something like this? No pressure."
            )
            
            self.state[chat_id] = {'step': 6, 'data': data}
            self.save_state()
            return
        
        # STEP 6: Likelihood
        if step == 6:
            data['try_score'] = text
            
            await self.bot.send_message(
                chat_id=chat_id,
                text="What's the one thing that would make you DELETE it after one use?"
            )
            
            self.state[chat_id] = {'step': 7, 'data': data}
            self.save_state()
            return
        
        # STEP 7: Objection + close
        if step == 7:
            data['objection'] = text
            
            # Log interview
            interview = {
                'chat_id': chat_id,
                'name': data.get('name'),
                'username': data.get('username'),
                'timestamp': datetime.now().isoformat(),
                'pain_point': data.get('pain_point'),
                'concept_useful': data.get('concept_useful'),
                'privacy': data.get('privacy'),
                'try_score': data.get('try_score'),
                'objection': data.get('objection'),
                'reaction': data.get('reaction')
            }
            self.log['interviews'].append(interview)
            self.save_log()
            
            await self.bot.send_message(
                chat_id=chat_id,
                text="That's really helpful, thanks {name}! 🙏 One more — anyone else you think would have thoughts on this?"
            )
            
            self.state[chat_id] = {'step': 8, 'data': data}
            self.save_state()
            self.update_progress()
            return
        
        # STEP 8: Referrals
        if step == 8:
            if text_lower not in ['no', 'none', 'nope', 'idk']:
                self.log['interviews'][-1]['referrals'] = text
            
            await self.bot.send_message(
                chat_id=chat_id,
                text="Alright, that's it. Really appreciate your honesty — this helps a lot. Thanks! 🙌"
            )
            
            self.state[chat_id] = {'step': 99, 'data': data}
            self.save_state()
    
    def save_state(self):
        json.dump(self.state, open(STATE_FILE, 'w'), indent=2)
    
    def save_log(self):
        json.dump(self.log, open(LOG_FILE, 'w'), indent=2)
    
    def update_progress(self):
        count = len(self.log['interviews'])
        print(f"\n{'='*50}")
        print(f"🎯 INTERVIEW PROGRESS: {count}/20")
        print(f"{'='*50}")
        
        # Update progress dashboard
        progress_md = BASE / 'PROGRESS.md'
        if progress_md.exists():
            content = progress_md.read_text()
            bar = '█' * count + '░' * (20 - count)
            percent = int((count / 20) * 100)
            content = content.replace(
                '░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/20 (0%)',
                f'{"█" * count}{"░" * (20 - count)}  {count}/20 ({percent}%)'
            )
            content = content.replace('**Completed** | 0', f'**Completed** | {count}')
            progress_md.write_text(content)
        
        # Also show recent interviews
        if count > 0:
            latest = self.log['interviews'][-1]
            print(f"\nLatest: {latest.get('name')} (@{latest.get('username')})")
            print(f"  Pain point: {latest.get('pain_point', 'N/A')[:50]}...")
            print(f"  Try score: {latest.get('try_score', 'N/A')}")

async def main():
    bot = NaturalInterviewBot()
    await bot.check_messages()

if __name__ == '__main__':
    asyncio.run(main())
