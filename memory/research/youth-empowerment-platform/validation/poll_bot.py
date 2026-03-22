#!/usr/bin/env python3
"""
Validation Interview Bot - Background Poller
Run this to check for new messages and conduct interviews
"""
import asyncio
import json
import os
from datetime import datetime
from telegram import Bot
from pathlib import Path

TOKEN = '8392406833:AAFKG-m9_c4z-5GnEaRy9VFYqVFLIy-NnKU'

# Paths
BASE = Path('/home/drg/.openclaw/workspace/memory/research/youth-empowerment-platform/validation')
STATE_FILE = BASE / 'interview_state.json'
LOG_FILE = BASE / 'interview_log.json'
LAST_UPDATE_FILE = BASE / 'last_update.json'

# Interview state
if not STATE_FILE.exists():
    json.dump({}, open(STATE_FILE, 'w'))

if not LOG_FILE.exists():
    json.dump({'interviews': []}, open(LOG_FILE, 'w'))

class InterviewBot:
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
                name = u.message.chat.first_name or "User"
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
        
        # Handle commands
        if text.lower() in ['/start', 'hi', 'hey', 'hello', 'start']:
            await self.bot.send_message(
                chat_id=chat_id,
                text=f"Hey {name}! 👋\n\nI'm doing research on apps that help people figure out what they want to do.\n\nGot 5-10 min for some questions? No pitch — just want your honest thoughts.\n\nSay 'yes' to start!"
            )
            self.state[chat_id] = {'step': 0, 'data': {'name': name, 'username': username}}
            self.save_state()
            return
        
        if text.lower() == 'yes' and step == 0:
            await self.bot.send_message(
                chat_id=chat_id,
                text=f"Great! 🎉\n\n**Q1:** What's something you want to do but haven't figured out how yet?\n\nJust answer however you want. No wrong answer."
            )
            self.state[chat_id] = {'step': 1, 'data': {'name': name, 'username': username}}
            self.save_state()
            return
        
        # Handle interview questions
        if step == 1:
            data['pain_point'] = text
            await self.bot.send_message(
                chat_id=chat_id,
                text=f"Got it. Thanks!\n\n**Q2:** Would you use an app where:\n- A personal AI gets to know you (your skills, goals)\n- Helps you track your growth/journey\n- Matches you with opportunities when they come up\n- Everything is private/encrypted\n\nYes, no, or maybe? Why?"
            )
            self.state[chat_id] = {'step': 2, 'data': data}
            self.save_state()
            return
        
        if step == 2:
            data['concept_useful'] = text
            await self.bot.send_message(
                chat_id=chat_id,
                text=f"**Q3:** How much do you care if apps see your data? (1 = don't care, 10 = super important)"
            )
            self.state[chat_id] = {'step': 3, 'data': data}
            self.save_state()
            return
        
        if step == 3:
            data['privacy_score'] = text
            await self.bot.send_message(
                chat_id=chat_id,
                text=f"**Q4:** On a scale of 1-10, how likely are you to try something like that?"
            )
            self.state[chat_id] = {'step': 4, 'data': data}
            self.save_state()
            return
        
        if step == 4:
            data['try_score'] = text
            await self.bot.send_message(
                chat_id=chat_id,
                text=f"**Q5:** What's the one thing that would make you NOT use it?"
            )
            self.state[chat_id] = {'step': 5, 'data': data}
            self.save_state()
            return
        
        if step == 5:
            data['objection'] = text
            
            # Log interview
            interview = {
                'chat_id': chat_id,
                'name': data.get('name'),
                'username': data.get('username'),
                'timestamp': datetime.now().isoformat(),
                'pain_point': data.get('pain_point'),
                'concept_useful': data.get('concept_useful'),
                'privacy_score': data.get('privacy_score'),
                'try_score': data.get('try_score'),
                'objection': data.get('objection')
            }
            self.log['interviews'].append(interview)
            self.save_log()
            
            await self.bot.send_message(
                chat_id=chat_id,
                text=f"That's really helpful, {name}! Thanks for your time. 🙏\n\nOne more: Who else should I talk to? Anyone curious about this kind of app?"
            )
            self.state[chat_id] = {'step': 6, 'data': data}
            self.save_state()
            return
        
        if step == 6:
            if text.lower() not in ['no', 'none', 'nope']:
                data['referrals'] = text
                self.log['interviews'][-1]['referrals'] = text
                self.save_log()
            
            await self.bot.send_message(
                chat_id=chat_id,
                text="Thanks! That's it — really appreciate your honesty. We'll build something better because of this. 🚀"
            )
            self.state[chat_id] = {'step': 99, 'data': data}
            self.save_state()
            self.update_progress()
            return
    
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
            # Update the progress bar
            bar = '█' * count + '░' * (20 - count)
            percent = int((count / 20) * 100)
            content = content.replace(
                '████████░░░░░░░░░░░░░░░░░░░░░░░░░░░  5/20 (25%)',
                f'█{"█" * count}{"░" * (20 - count)}  {count}/20 ({percent}%)'
            )
            content = content.replace('**Completed** | 0 | 20', f'**Completed** | {count} | 20')
            progress_md.write_text(content)

async def main():
    bot = InterviewBot()
    await bot.check_messages()

if __name__ == '__main__':
    asyncio.run(main())
