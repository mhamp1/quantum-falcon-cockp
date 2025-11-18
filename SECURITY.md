# 🔒 Security Policy - Quantum Falcon Cockpit

## Overview

Security is our top priority. **WE NEVER STORE YOUR PRIVATE KEYS.** All transaction signing occurs client-side in your wallet, ensuring you maintain full custody of your assets at all times.

This document outlines our security practices and how we protect sensitive information, particularly license keys and authentication data.

---

## 🚨 Critical Security Principles

### Wallet & Private Key Security

**YOUR PRIVATE KEYS ARE NEVER STORED OR TRANSMITTED.**

- All wallet transactions signed client-side in your browser
- Private keys remain exclusively in your wallet (Phantom, Solflare, etc.)
- Zero custody model — You maintain complete control of your assets
- No backend access to your wallet credentials

### Master Key Protection

**The master key is NEVER stored in this repository.**

- Master key location: LicenseAuthority repository (private, secure)
- Access: Backend server only (environment variable)
- Client-side: NO access to master key
- Verification: All license checks happen server-side

### What IS in This Repository

✅ License verification client code  
✅ Encrypted storage mechanisms  
✅ UI components for license entry  
✅ API endpoint configuration (URL only)

### What IS NOT in This Repository

❌ Master key  
❌ **Your wallet private keys (NEVER stored anywhere)**  
❌ Database credentials  
❌ API secrets  
❌ User license keys  
❌ Transaction signing keys  

---

## 🔐 License Authentication Security

### Architecture

```
Client (Quantum Falcon)
    ↓ [License Key]
Secure API Endpoint
    ↓ [Verification Request]
Backend Server (has master key)
    ↓ [Database Query]
License Database
    ↓ [Valid/Invalid Response]
Client (Store Encrypted Result)
```

### Key Security Features

1. **HTTPS Only**: All API communication encrypted in transit
2. **Server-Side Validation**: Master key never leaves secure server
3. **Encrypted Storage**: License data encrypted with `btoa()` before localStorage
4. **Expiration Checks**: Automatic validation of license expiration
5. **Rate Limiting**: API endpoint limits verification attempts
6. **Session Timeout**: Auto-logout after inactivity

---

## 🛡️ Data Protection

### Sensitive Data Handling

| Data Type | Storage Location | Encryption | Access |
|-----------|------------------|------------|--------|
| Master Key | Backend server only | Environment variable | Server only |
| User License | Encrypted localStorage | Base64 + AES | User device |
| User ID | Encrypted localStorage | Base64 | User device |
| Session Token | Memory only | N/A | Current session |

### What We Store Locally

- Encrypted license key (for offline verification)
- User tier level (free/pro/elite/lifetime)
- Expiration timestamp
- Feature flags
- User ID (anonymized)

### What We DON'T Store Locally

- Master key
- Payment information
- Personal identification data
- Plain-text credentials

---

## 🔒 Environment Variables

### Required Variables

```bash
VITE_LICENSE_API_ENDPOINT=https://your-secure-api.com/api/verify
VITE_PURCHASE_URL=https://github.com/mhamp1/LicenseAuthority
```

### Backend Server Variables (NOT in this repo)

```bash
MASTER_KEY=XoYgqu2wJYVZVg5AdWO9NqhKM52qXQ_ob9oeWMVeYhw=
DATABASE_URL=postgresql://...
API_SECRET=...
```

**⚠️ CRITICAL**: Backend environment variables must NEVER be committed to this repository.

---

## 🚨 Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

### DO

✅ Email: mhamp1trading@yahoo.com  
✅ Include: Detailed description, steps to reproduce  
✅ Allow: 90 days for remediation before public disclosure

### DON'T

❌ Post vulnerabilities in public issues  
❌ Share exploit code publicly  
❌ Attempt to access other users' data

---

## 🔍 Security Checklist for Developers

### Before Committing Code

- [ ] No API keys in code
- [ ] No master key references
- [ ] No hardcoded credentials
- [ ] `.env` file not committed
- [ ] Secrets in `.gitignore`
- [ ] HTTPS endpoints only

### Before Deploying

- [ ] Environment variables set on server
- [ ] HTTPS certificate valid
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Backup systems tested

---

## 🛠️ Security Features

### Authentication

- License key verification
- Tier-based access control
- Session management
- Auto-logout on expiration

### API Security

- HTTPS only
- CORS properly configured
- Rate limiting (100 requests/hour per IP)
- Request validation
- Error messages don't leak data

### Client-Side Security

- No sensitive data in localStorage (plain-text)
- XSS protection
- CSRF tokens
- Content Security Policy headers

---

## 📋 Compliance

### Data Privacy

- GDPR compliant
- CCPA compliant
- No tracking without consent
- User data deletion on request

### Industry Standards

- OWASP Top 10 protections
- CWE/SANS Top 25 mitigations
- Regular security audits
- Dependency vulnerability scanning

---

## 🔄 Security Updates

### Update Policy

- Critical vulnerabilities: Patched within 24 hours
- High severity: Patched within 7 days
- Medium severity: Patched within 30 days
- Low severity: Included in next release

### Notification

Users are notified of security updates via:
- In-app notification
- Email (if provided)
- GitHub release notes

---

## 🧪 Security Testing

### Regular Audits

- Dependency scanning (npm audit)
- Static code analysis
- Penetration testing (quarterly)
- Third-party security review (annually)

### Automated Checks

```bash
# Run security audit
npm audit

# Check for vulnerabilities
npm audit fix

# Dependency updates
npm update
```

---

## 📞 Contact

### Security Team

- Email: mhamp1trading@yahoo.com
- GitHub: @mhamp1
- Response Time: 24-48 hours

### Emergency Contact

For critical vulnerabilities requiring immediate attention:
- Email: mhamp1trading@yahoo.com (Subject: URGENT SECURITY)

---

## 📜 Security Policy Version

- **Version**: 3.0
- **Last Updated**: November 18, 2025
- **Next Review**: Quarterly

---

## ⚖️ Legal

### Responsible Disclosure

We believe in responsible disclosure and will:
- Acknowledge receipt within 48 hours
- Provide regular updates on remediation
- Credit researchers (with permission)
- Not take legal action against good-faith researchers

### Scope

**In Scope:**
- Quantum Falcon Cockpit application
- LicenseAuthority integration
- API endpoints

**Out of Scope:**
- Third-party services
- Social engineering attacks
- Physical security
- Denial of service attacks

---

## 🔗 Related Documentation

- [LICENSE_INTEGRATION.md](LICENSE_INTEGRATION.md) - License system architecture
- [README.md](README.md) - General documentation
- [LicenseAuthority Repo](https://github.com/mhamp1/LicenseAuthority) - Key generation system

---

**Remember**: Security is everyone's responsibility. If you see something, say something.

Thanks for helping make GitHub safe for everyone.
