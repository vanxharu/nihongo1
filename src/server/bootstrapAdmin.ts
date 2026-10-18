export function getBootstrapAdminEmails(): Set<string> {
  const envVar = process.env.ADMIN_EMAILS || '';
  const set = new Set<string>();
  if (envVar) {
    envVar.split(',').forEach(email => {
      const trimmed = email.trim().toLowerCase();
      if (trimmed) set.add(trimmed);
    });
  }
  return set;
}

export function isBootstrapAdmin(email: string | undefined, emailVerified: boolean): boolean {
  return emailVerified === true && getBootstrapAdminEmails().has((email || '').trim().toLowerCase());
}
