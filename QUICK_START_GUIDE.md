# 🚀 Quantum Falcon Settings - Quick Start Guide

## New Features Overview

Your Settings tab has been supercharged with powerful new capabilities! Here's how to use them:

---

## 🔍 1. Settings Search Bar

**Location**: Top of Settings page, right below the "SETTINGS" header

**What it does**: Instantly find any setting without clicking through tabs

**How to use**:
1. Click the search box
2. Type what you're looking for (examples: "2FA", "theme", "slippage", "volume")
3. Click any result to jump directly to that setting
4. The setting will pulse with a glow so you can spot it easily

**Pro Tips**:
- Search is typo-tolerant
- Works with partial words
- Shows which tab the setting is in
- Try: "auth", "notification", "display", "trading"

---

## 📊 2. Change Log Tab

**Location**: Settings → CHANGE_LOG tab (in the navigation bar)

**What it does**: Tracks every change you make to your settings

**How to use**:
1. Click the "CHANGE_LOG" tab
2. See all your recent changes with timestamps
3. Filter by category (security, notifications, audio, etc.)
4. Sort by newest or oldest
5. Export to CSV for your records

**What you'll see**:
- Date and time of each change
- Which setting was changed
- Old value → New value
- Category label

**Pro Tips**:
- Passwords and API keys are automatically masked (••••••••)
- Logs are kept for 90 days then auto-deleted for privacy
- Export CSV before it auto-deletes if you need long-term records

---

## 🖥️ 3. Device Management Tab

**Location**: Settings → DEVICES tab (between Security and Subscription)

**What it does**: Shows all devices logged into your account

**How to use**:
1. Click the "DEVICES" tab
2. Review all active sessions
3. Check for unfamiliar devices or locations
4. Click "Revoke" next to any suspicious device
5. Use "Revoke All Others" to logout everywhere except your current device

**What you'll see for each device**:
- Device type (mobile, desktop, laptop)
- Browser and operating system
- IP address (partially masked for privacy)
- Location (city, state, country)
- Last active time
- Login timestamp

**Security Tips**:
- Check this weekly for suspicious activity
- Revoke old sessions you no longer use
- If you see an unknown device, revoke it immediately and change your password

---

## 🔐 4. Data Export & Deletion (GDPR/CCPA Compliance)

**Location**: Settings → LEGAL tab → scroll to "Data Management" section

**What it does**: Gives you full control over your personal data

### Export Your Data
**How to use**:
1. Go to Settings → LEGAL
2. Scroll to "Data Management"
3. Click "Export Data (JSON)"
4. A file will download with all your data

**What's included**:
- Your profile information
- All settings and preferences
- Change log history
- Device sessions (auth tokens masked for security)
- Export timestamp and version

### Delete Your Data
**How to use**:
1. Go to Settings → LEGAL
2. Scroll to "Data Management"
3. Click "Request Data Deletion"
4. Confirm TWICE (this is permanent!)
5. All your data will be erased
6. Page will auto-refresh after 3 seconds

**⚠️ WARNING**: This is PERMANENT and CANNOT be undone!

**What gets deleted**:
- Your profile
- All settings
- Change log history
- Device sessions
- Terms acceptance records

---

## 🎯 Quick Access Examples

### "I want to enable Two-Factor Authentication"
1. Use search bar → type "2fa" or "two factor"
2. Click the result
3. Toggle the switch

### "I want to see what I changed last week"
1. Go to CHANGE_LOG tab
2. Sort by newest
3. Scroll through your changes

### "I think someone else is logged into my account"
1. Go to DEVICES tab
2. Look for unfamiliar devices or locations
3. Click "Revoke" on suspicious sessions
4. Go to Security tab and change your password

### "I need to export my data for my records"
1. Go to LEGAL tab
2. Scroll to "Data Management"
3. Click "Export Data (JSON)"
4. Save the file somewhere safe

---

## 🎨 Visual Indicators

### Status Dots
- 🟢 **Green (Active)**: Device was active in the last hour
- 🟡 **Yellow (Warning)**: Device was active in the last 24 hours
- ⚫ **Gray (Inactive)**: Device hasn't been active in over 24 hours

### Badges
- **CURRENT**: Your current device (cannot be revoked)
- Category badges in search results show which tab the setting is in

### Color Coding
- 🔵 **Blue/Cyan (Primary)**: General settings, main actions
- 🟣 **Purple (Secondary)**: Trading and network settings
- 🟡 **Yellow (Accent)**: Audio and community settings
- 🔴 **Red (Destructive)**: Security warnings and delete actions

---

## ❓ FAQ

**Q: Is my data private?**  
A: Yes! All data is stored locally on your device. Change logs and session data never leave your browser unless you explicitly export them.

**Q: How long are change logs kept?**  
A: 90 days, then automatically deleted for privacy.

**Q: Can I undo a data deletion request?**  
A: No. Data deletion is permanent and cannot be reversed. Always export first if unsure.

**Q: Why do I see masked IP addresses?**  
A: For privacy. We show partial IPs (192.168.•.•) to help you identify your devices without exposing full addresses.

**Q: What happens if I revoke my current session?**  
A: You can't! The system prevents you from revoking your current device to avoid locking yourself out.

**Q: Does the search bar work offline?**  
A: Yes! It searches your local settings index instantly without any network requests.

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the System Status at the bottom of APP_SETTINGS tab
2. Try refreshing the page
3. Export your data before making major changes
4. Contact support at legal@quantumfalcon.ai

---

**Pro Tip**: Bookmark this guide! Press `Ctrl+D` (Windows) or `Cmd+D` (Mac) to save for later reference.

---

**Version**: 2.1.0  
**Last Updated**: 2025-01-19  
**Need more help?** Check `SETTINGS_IMPROVEMENTS.md` for technical details
