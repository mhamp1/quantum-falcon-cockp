#!/usr/bin/env python3
# LICENSE AUTHORITY v2: Now full paywall + onboarding brain — November 19, 2025
# cli.py - Command-line interface for License Authority

import sys
import argparse
from datetime import datetime
from .license_generator import generate_license, generate_license_key
from .validation_service import validate_license, decode_license_key
from .master_key_manager import generate_master_key, load_master_key
from .models import LicenseTier, get_tier_features
from .database import init_db, get_db_session
from .models import License, AuditLog
import json


def cmd_generate(args):
    """Generate a new license"""
    print("=== License Authority v2 - Generate License ===\n")
    
    # Validate tier
    try:
        tier = LicenseTier(args.tier)
    except ValueError:
        print(f"✗ Invalid tier: {args.tier}")
        print(f"Valid tiers: {', '.join([t.value for t in LicenseTier])}")
        return 1
    
    try:
        result = generate_license(
            user_id=args.user_id,
            email=args.email,
            tier=tier,
            expires_days=args.expires_days,
            hardware_id=args.hardware_id,
            is_floating=args.floating,
            payment_id=args.payment_id,
            payment_provider=args.payment_provider
        )
        
        print("✓ License generated successfully!\n")
        print(f"License Key: {result['license_key']}")
        print(f"User ID:     {result['user_id']}")
        print(f"Email:       {result.get('email', 'N/A')}")
        print(f"Tier:        {result['tier'].upper()}")
        print(f"Expires:     {result['expires_at'] or 'Never (Lifetime)'}")
        print(f"Created:     {result['created_at']}")
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"\n✓ License details saved to: {args.output}")
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error generating license: {e}")
        return 1


def cmd_validate(args):
    """Validate a license"""
    print("=== License Authority v2 - Validate License ===\n")
    
    try:
        result = validate_license(
            license_key=args.license_key,
            hardware_id=args.hardware_id,
            ip_address=args.ip_address
        )
        
        if result['valid']:
            print("✓ License is VALID\n")
            print(f"User ID:     {result.get('user_id', 'N/A')}")
            print(f"Email:       {result.get('email', 'N/A')}")
            print(f"Tier:        {result['tier'].upper()}")
            
            if result.get('expires_at'):
                expires = datetime.fromtimestamp(result['expires_at'])
                print(f"Expires:     {expires.strftime('%Y-%m-%d %H:%M:%S')}")
            else:
                print(f"Expires:     Never (Lifetime)")
            
            if result.get('is_grace_period'):
                print(f"\n⚠️  Currently in GRACE PERIOD")
            
            if result.get('days_until_expiry') is not None:
                print(f"Days Left:   {result['days_until_expiry']}")
            
            print(f"\nMax Agents:  {result.get('max_agents', 'N/A')}")
            print(f"Features:    {len(result.get('features', []))} features")
            
            if args.verbose:
                print("\nFeatures:")
                for feature in result.get('features', []):
                    print(f"  ✓ {feature}")
            
            if args.output:
                with open(args.output, 'w') as f:
                    json.dump(result, f, indent=2)
                print(f"\n✓ Validation details saved to: {args.output}")
        else:
            print("✗ License is INVALID\n")
            print(f"Error: {result.get('error', 'Unknown error')}")
            return 1
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error validating license: {e}")
        return 1


def cmd_decode(args):
    """Decode a license key"""
    print("=== License Authority v2 - Decode License Key ===\n")
    
    try:
        data = decode_license_key(args.license_key)
        
        if data:
            print("✓ License key decoded successfully\n")
            print(json.dumps(data, indent=2))
        else:
            print("✗ Failed to decode license key")
            return 1
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error decoding license: {e}")
        return 1


def cmd_list(args):
    """List licenses"""
    print("=== License Authority v2 - License List ===\n")
    
    db = get_db_session()
    try:
        query = db.query(License)
        
        if args.tier:
            query = query.filter(License.tier == args.tier)
        
        if args.active_only:
            query = query.filter(
                License.is_active == True,
                License.is_revoked == False
            )
        
        licenses = query.order_by(License.created_at.desc()).limit(args.limit).all()
        
        if not licenses:
            print("No licenses found.")
            return 0
        
        print(f"Found {len(licenses)} license(s):\n")
        
        for lic in licenses:
            status = "ACTIVE" if lic.is_active and not lic.is_revoked else "REVOKED" if lic.is_revoked else "INACTIVE"
            expires = lic.expires_at.strftime('%Y-%m-%d') if lic.expires_at else "Never"
            
            print(f"ID: {lic.id}")
            print(f"  User:    {lic.user_id}")
            print(f"  Tier:    {lic.tier.upper()}")
            print(f"  Status:  {status}")
            print(f"  Expires: {expires}")
            print(f"  Created: {lic.created_at.strftime('%Y-%m-%d %H:%M')}")
            
            if args.verbose:
                print(f"  Key:     {lic.license_key[:50]}...")
            
            print()
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error listing licenses: {e}")
        return 1
    finally:
        db.close()


def cmd_revoke(args):
    """Revoke a license"""
    print("=== License Authority v2 - Revoke License ===\n")
    
    if not args.reason:
        print("✗ Revocation reason is required (--reason)")
        return 1
    
    db = get_db_session()
    try:
        license = db.query(License).filter(
            License.license_key == args.license_key
        ).first()
        
        if not license:
            print("✗ License not found")
            return 1
        
        if license.is_revoked:
            print("⚠️  License is already revoked")
            return 0
        
        license.is_revoked = True
        license.revoked_at = datetime.utcnow()
        license.revoked_reason = args.reason
        license.is_active = False
        
        db.commit()
        
        print("✓ License revoked successfully\n")
        print(f"User ID: {license.user_id}")
        print(f"Tier:    {license.tier.upper()}")
        print(f"Reason:  {args.reason}")
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error revoking license: {e}")
        db.rollback()
        return 1
    finally:
        db.close()


def cmd_audit(args):
    """Show audit logs"""
    print("=== License Authority v2 - Audit Logs ===\n")
    
    db = get_db_session()
    try:
        query = db.query(AuditLog)
        
        if args.user_id:
            query = query.filter(AuditLog.user_id == args.user_id)
        
        if args.success_only:
            query = query.filter(AuditLog.success == True)
        
        logs = query.order_by(AuditLog.timestamp.desc()).limit(args.limit).all()
        
        if not logs:
            print("No audit logs found.")
            return 0
        
        print(f"Found {len(logs)} log(s):\n")
        
        for log in logs:
            status = "✓" if log.success else "✗"
            print(f"{status} [{log.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {log.action}")
            print(f"  User:    {log.user_id or 'N/A'}")
            print(f"  IP:      {log.ip_address or 'N/A'}")
            
            if log.error_message:
                print(f"  Error:   {log.error_message}")
            
            print()
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error fetching audit logs: {e}")
        return 1
    finally:
        db.close()


def cmd_init(args):
    """Initialize database and master key"""
    print("=== License Authority v2 - Initialize ===\n")
    
    try:
        # Generate master key if needed
        try:
            load_master_key()
            print("✓ Master key already exists")
        except FileNotFoundError:
            print("Generating master key...")
            generate_master_key()
            print("✓ Master key generated")
        
        # Initialize database
        print("Initializing database...")
        init_db()
        print("✓ Database initialized")
        
        print("\n✓ Initialization complete!")
        return 0
        
    except Exception as e:
        print(f"\n✗ Error during initialization: {e}")
        return 1


def cmd_tiers(args):
    """Show available tiers"""
    print("=== License Authority v2 - Available Tiers ===\n")
    
    for tier in LicenseTier:
        features = get_tier_features(tier)
        
        print(f"[{tier.value.upper()}] {features['name']}")
        print(f"  Price:      {features.get('price', 'N/A')}")
        
        if isinstance(features.get('price'), (int, float)):
            billing = features.get('billing_period', 'once')
            if billing != 'once':
                print(f"  Billing:    {billing}")
        
        print(f"  Strategies: {features.get('strategies', 'N/A')}")
        print(f"  Max Agents: {features.get('max_agents', 'N/A')}")
        
        if args.verbose:
            print(f"  Features:")
            for feature in features.get('features', [])[:5]:
                print(f"    ✓ {feature}")
            
            if len(features.get('features', [])) > 5:
                print(f"    ... and {len(features['features']) - 5} more")
        
        print()
    
    return 0


def main():
    parser = argparse.ArgumentParser(
        description='License Authority v2 - Complete license management system',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Initialize system
  %(prog)s init
  
  # Generate a Pro license
  %(prog)s generate --user-id user@example.com --tier pro --email user@example.com
  
  # Validate a license
  %(prog)s validate YOUR_LICENSE_KEY
  
  # List active licenses
  %(prog)s list --active-only
  
  # Show available tiers
  %(prog)s tiers -v
"""
    )
    
    parser.add_argument('--version', action='version', version='%(prog)s 2.0.0')
    
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Init command
    parser_init = subparsers.add_parser('init', help='Initialize database and master key')
    parser_init.set_defaults(func=cmd_init)
    
    # Generate command
    parser_gen = subparsers.add_parser('generate', help='Generate a new license')
    parser_gen.add_argument('--user-id', required=True, help='User ID or email')
    parser_gen.add_argument('--email', help='User email address')
    parser_gen.add_argument('--tier', default='free', help='License tier (default: free)')
    parser_gen.add_argument('--expires-days', type=int, help='Days until expiration')
    parser_gen.add_argument('--hardware-id', help='Hardware ID for binding')
    parser_gen.add_argument('--floating', action='store_true', help='Floating license')
    parser_gen.add_argument('--payment-id', help='Payment ID')
    parser_gen.add_argument('--payment-provider', help='Payment provider')
    parser_gen.add_argument('--output', '-o', help='Output file for license data')
    parser_gen.set_defaults(func=cmd_generate)
    
    # Validate command
    parser_val = subparsers.add_parser('validate', help='Validate a license')
    parser_val.add_argument('license_key', help='License key to validate')
    parser_val.add_argument('--hardware-id', help='Hardware ID')
    parser_val.add_argument('--ip-address', help='IP address')
    parser_val.add_argument('--verbose', '-v', action='store_true', help='Show all features')
    parser_val.add_argument('--output', '-o', help='Output file for validation data')
    parser_val.set_defaults(func=cmd_validate)
    
    # Decode command
    parser_decode = subparsers.add_parser('decode', help='Decode a license key')
    parser_decode.add_argument('license_key', help='License key to decode')
    parser_decode.set_defaults(func=cmd_decode)
    
    # List command
    parser_list = subparsers.add_parser('list', help='List licenses')
    parser_list.add_argument('--tier', help='Filter by tier')
    parser_list.add_argument('--active-only', action='store_true', help='Show only active licenses')
    parser_list.add_argument('--limit', type=int, default=20, help='Maximum results (default: 20)')
    parser_list.add_argument('--verbose', '-v', action='store_true', help='Show license keys')
    parser_list.set_defaults(func=cmd_list)
    
    # Revoke command
    parser_revoke = subparsers.add_parser('revoke', help='Revoke a license')
    parser_revoke.add_argument('license_key', help='License key to revoke')
    parser_revoke.add_argument('--reason', required=True, help='Revocation reason')
    parser_revoke.set_defaults(func=cmd_revoke)
    
    # Audit command
    parser_audit = subparsers.add_parser('audit', help='Show audit logs')
    parser_audit.add_argument('--user-id', help='Filter by user ID')
    parser_audit.add_argument('--success-only', action='store_true', help='Show only successful actions')
    parser_audit.add_argument('--limit', type=int, default=50, help='Maximum results (default: 50)')
    parser_audit.set_defaults(func=cmd_audit)
    
    # Tiers command
    parser_tiers = subparsers.add_parser('tiers', help='Show available tiers')
    parser_tiers.add_argument('--verbose', '-v', action='store_true', help='Show features')
    parser_tiers.set_defaults(func=cmd_tiers)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    return args.func(args)


if __name__ == '__main__':
    sys.exit(main())
