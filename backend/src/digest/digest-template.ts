export const DIGEST_PLACEHOLDERS = [
  'name',
  'gamesPlayed',
  'winRate',
  'streak',
  'rank',
  'rankChange',
] as const;

export type DigestPlaceholder = (typeof DIGEST_PLACEHOLDERS)[number];

export const DEFAULT_DIGEST_SUBJECT = 'Your DeWordle week in review';

/** Inline styles only: most mail clients drop <style> blocks. */
export const DEFAULT_DIGEST_HTML = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#0b1020;color:#ffffff;">
  <h1 style="margin:0 0 8px;font-size:22px;color:#ffffff;">Hi {{name}}, here is your week</h1>
  <p style="margin:0 0 16px;color:#b8c0d9;">A quick look at how you played over the last 7 days.</p>
  <table role="presentation" width="100%" style="border-collapse:collapse;">
    <tr><td style="padding:10px;background:#151c33;color:#b8c0d9;">Games played</td><td style="padding:10px;background:#151c33;text-align:right;font-weight:bold;">{{gamesPlayed}}</td></tr>
    <tr><td style="padding:10px;background:#1b2340;color:#b8c0d9;">Win rate</td><td style="padding:10px;background:#1b2340;text-align:right;font-weight:bold;">{{winRate}}</td></tr>
    <tr><td style="padding:10px;background:#151c33;color:#b8c0d9;">Streak</td><td style="padding:10px;background:#151c33;text-align:right;font-weight:bold;">{{streak}}</td></tr>
    <tr><td style="padding:10px;background:#1b2340;color:#b8c0d9;">Rank</td><td style="padding:10px;background:#1b2340;text-align:right;font-weight:bold;">{{rank}} ({{rankChange}})</td></tr>
  </table>
  <p style="margin:16px 0 0;font-size:12px;color:#8a93b2;">You can turn this email off in your profile settings.</p>
</div>`;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Replaces `{{placeholder}}` tokens with HTML-escaped values. */
export function renderDigestTemplate(
  template: string,
  values: Record<DigestPlaceholder, string>,
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) =>
    key in values ? escapeHtml(values[key as DigestPlaceholder]) : match,
  );
}

/** Returns an error message when the template is not safe to store. */
export function validateDigestTemplate(subject: string, html: string): string | null {
  if (/<\s*script/i.test(html) || /\son\w+\s*=/i.test(html)) {
    return 'Template must not contain scripts or inline event handlers';
  }
  const unknown = [...(subject + html).matchAll(/\{\{\s*(\w+)\s*\}\}/g)]
    .map((m) => m[1])
    .filter((k) => !(DIGEST_PLACEHOLDERS as readonly string[]).includes(k));
  if (unknown.length > 0) {
    return `Unknown placeholder(s): ${[...new Set(unknown)].join(', ')}`;
  }
  return null;
}
