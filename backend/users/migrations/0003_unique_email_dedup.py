"""
Migration 0003: Enforce unique email on auth_user.
  1. De-duplicate any existing rows (keeps the lowest pk, merges the rest).
  2. Adds the unique constraint.
"""
from django.db import migrations, models


def deduplicate_emails(apps, schema_editor):
    """Keep the earliest user per email; delete later duplicates."""
    User = apps.get_model('auth', 'User')
    from django.db.models import Min

    seen = {}
    for user in User.objects.order_by('id'):
        email = user.email.strip().lower()
        if not email:
            continue
        if email in seen:
            # duplicate — delete the later record
            user.delete()
        else:
            # normalise the email to lowercase and save
            if user.email != email:
                user.email = email
                user.save(update_fields=['email'])
            seen[email] = user.pk


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_sellerapplication_address_and_more'),
    ]

    operations = [
        # Step 1: clean up duplicates in Python (before constraint is added)
        migrations.RunPython(deduplicate_emails, migrations.RunPython.noop),
        # Step 2: add UNIQUE constraint to auth_user.email via a proxy AlterField
        migrations.RunSQL(
            sql="""
                CREATE UNIQUE INDEX IF NOT EXISTS auth_user_email_unique
                ON auth_user (LOWER(email))
                WHERE email != '';
            """,
            reverse_sql="DROP INDEX IF EXISTS auth_user_email_unique;",
        ),
    ]
