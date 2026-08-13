import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const FROM = `"AquaPro" <${process.env.EMAIL_USER}>`

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({ from: FROM, to, subject, html })
}

function base(content: string) {
  return `
  <!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a1628;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:28px;font-weight:700;color:#00b4d8;letter-spacing:2px">AQUAPRO</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px">Pool Maintenance Management</div>
    </div>
    <div style="background:#0f1e35;border-radius:12px;padding:32px;border:1px solid #1a2d45">
      ${content}
    </div>
    <div style="text-align:center;margin-top:24px;font-size:11px;color:#334155">
      AquaPro Pool Maintenance Management<br>
      <a href="#" style="color:#00b4d8;text-decoration:none">Unsubscribe</a>
    </div>
  </div>
  </body></html>
  `
}

export function buildWaterAlertEmail(poolName: string, riskLevel: string, flags: string[], testUrl: string) {
  const riskColour = riskLevel === 'red' ? '#d63031' : riskLevel === 'orange' ? '#e17055' : '#fdcb6e'
  const riskLabel = riskLevel === 'red' ? 'CLOSE POOL — CRITICAL' : riskLevel === 'orange' ? 'Action Required' : 'Monitor'

  return base(`
    <h2 style="margin:0 0 16px;color:#ffffff">Water Quality Alert</h2>
    <div style="background:${riskColour}22;border:1px solid ${riskColour};border-radius:8px;padding:16px;margin-bottom:24px">
      <div style="color:${riskColour};font-weight:700;font-size:18px">${riskLabel}</div>
      <div style="color:#cbd5e1;margin-top:4px">${poolName}</div>
    </div>
    <p style="color:#94a3b8;margin:0 0 16px">The following parameters are out of range:</p>
    <ul style="color:#e2e8f0;margin:0 0 24px;padding-left:20px">
      ${flags.map(f => `<li style="margin-bottom:8px">${f}</li>`).join('')}
    </ul>
    <a href="${testUrl}" style="display:inline-block;background:#00b4d8;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
      View Test Details &amp; AI Advice
    </a>
  `)
}

export function buildComplianceDueEmail(poolName: string, eventType: string, dueDate: string, dashboardUrl: string) {
  return base(`
    <h2 style="margin:0 0 16px;color:#ffffff">Compliance Reminder</h2>
    <p style="color:#94a3b8;margin:0 0 24px">The following compliance event is due for <strong style="color:#e2e8f0">${poolName}</strong>:</p>
    <div style="background:#1a2d45;border-radius:8px;padding:20px;margin-bottom:24px">
      <div style="color:#e2e8f0;font-size:18px;font-weight:600">${eventType}</div>
      <div style="color:#fdcb6e;margin-top:8px">Due: ${dueDate}</div>
    </div>
    <a href="${dashboardUrl}" style="display:inline-block;background:#00b4d8;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
      View in Dashboard
    </a>
  `)
}

export function buildShiftReminderEmail(staffName: string, poolName: string, shiftDate: string, shiftType: string) {
  return base(`
    <h2 style="margin:0 0 16px;color:#ffffff">Shift Reminder</h2>
    <p style="color:#94a3b8;margin:0 0 24px">Hi ${staffName},</p>
    <p style="color:#94a3b8;margin:0 0 24px">You have a shift scheduled for tomorrow:</p>
    <div style="background:#1a2d45;border-radius:8px;padding:20px;margin-bottom:24px">
      <div style="color:#00b4d8;font-size:16px;font-weight:600">${poolName}</div>
      <div style="color:#e2e8f0;margin-top:8px">${shiftType}</div>
      <div style="color:#64748b;margin-top:4px">${shiftDate}</div>
    </div>
    <p style="color:#64748b;font-size:13px">Log in to your technician portal for full job details.</p>
  `)
}

export function buildWelcomeEmail(firstName: string, email: string, password: string, loginUrl: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#060f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060f1e;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr>
          <td style="background:#0a1628;border-radius:12px 12px 0 0;padding:28px 32px;border-bottom:1px solid #0e2040;">
            <p style="margin:0;font-size:22px;font-weight:800;color:#00b4d8;letter-spacing:2px;">AQUAPRO</p>
            <p style="margin:4px 0 0;font-size:11px;color:#334155;letter-spacing:0.08em;text-transform:uppercase;">Pool Maintenance Management</p>
          </td>
        </tr>
        <tr>
          <td style="background:#0f1e35;padding:32px;border:1px solid #0e2040;border-top:none;">
            <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#ffffff;">Welcome, ${firstName}</p>
            <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;line-height:1.6;">
              Your AquaPro admin account is ready. Use the credentials below to sign in and start configuring your pool management system.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;background:#070e1c;border:1px solid #0e2040;border-radius:10px;overflow:hidden;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#334155;text-transform:uppercase;letter-spacing:0.08em;">Your Login Details</p>
                <p style="margin:0 0 10px;font-size:13px;color:#64748b;">
                  Email: <strong style="color:#e2e8f0;font-family:monospace;">${email}</strong>
                </p>
                <p style="margin:0;font-size:13px;color:#64748b;">
                  Password: <strong style="color:#e2e8f0;font-family:monospace;letter-spacing:0.05em;">${password}</strong>
                </p>
              </td></tr>
            </table>

            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="background:#00b4d8;border-radius:8px;">
                  <a href="${loginUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                    Sign in to AquaPro →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#334155;line-height:1.6;">
              We recommend changing your password after your first login.<br>
              If you have any issues, reply to this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#070e1c;border-radius:0 0 12px 12px;padding:16px 32px;border:1px solid #0e2040;border-top:none;">
            <p style="margin:0;font-size:11px;color:#334155;">AquaPro · <a href="${loginUrl}" style="color:#334155;">${loginUrl}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendWelcomeEmail(firstName: string, email: string, password: string, loginUrl: string) {
  await sendEmail(email, 'Your AquaPro account is ready', buildWelcomeEmail(firstName, email, password, loginUrl))
}

export function buildStaffFeedbackEmail(
  type: string, title: string, priority: string, submittedBy: string,
  description: string, pageUrl: string | null, aiWorkaround: string | null, dashboardUrl: string
) {
  return base(`
    <h2 style="margin:0 0 16px;color:#ffffff">New ${type} report</h2>
    <div style="background:#1a2d45;border-radius:8px;padding:20px;margin-bottom:20px">
      <div style="color:#e2e8f0;font-size:16px;font-weight:600">${title}</div>
      <div style="color:#64748b;margin-top:6px;font-size:13px">By ${submittedBy} · Priority: ${priority}${pageUrl ? ` · ${pageUrl}` : ''}</div>
      ${description ? `<p style="color:#94a3b8;margin:12px 0 0;font-size:14px">${description}</p>` : ''}
    </div>
    ${aiWorkaround ? `
    <div style="background:#00b89418;border:1px solid #00b89440;border-radius:8px;padding:16px;margin-bottom:24px">
      <div style="color:#00b894;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">AI-suggested workaround</div>
      <div style="color:#e2e8f0;font-size:14px">${aiWorkaround}</div>
    </div>` : ''}
    <a href="${dashboardUrl}" style="display:inline-block;background:#00b4d8;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
      View in Error Log
    </a>
  `)
}

// Brett always gets every report regardless of who's in the staff table, so he's
// never missing the notification he needs to run the next fix-the-queue session.
const DEVELOPER_EMAIL = 'brett@aceperformance.com.au'

export async function sendStaffFeedbackEmail(
  adminEmails: string[], type: string, title: string, priority: string, submittedBy: string,
  description: string, pageUrl: string | null, aiWorkaround: string | null, dashboardUrl: string
) {
  const html = buildStaffFeedbackEmail(type, title, priority, submittedBy, description, pageUrl, aiWorkaround, dashboardUrl)
  const recipients = new Set([...adminEmails, DEVELOPER_EMAIL])
  for (const email of recipients) {
    try { await sendEmail(email, `New ${type}: ${title}`, html) } catch {}
  }
}

export function buildStaffFeedbackDoneEmail(title: string, dashboardUrl: string) {
  return base(`
    <h2 style="margin:0 0 16px;color:#ffffff">Your report has been actioned</h2>
    <p style="color:#94a3b8;margin:0 0 20px">The following item you reported is now marked done:</p>
    <div style="background:#1a2d45;border-radius:8px;padding:20px;margin-bottom:24px">
      <div style="color:#e2e8f0;font-size:16px;font-weight:600">${title}</div>
    </div>
    <a href="${dashboardUrl}" style="display:inline-block;background:#00b4d8;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
      View in Dashboard
    </a>
  `)
}

export async function sendStaffFeedbackDoneEmail(email: string, title: string, dashboardUrl: string) {
  try { await sendEmail(email, `Fixed: ${title}`, buildStaffFeedbackDoneEmail(title, dashboardUrl)) } catch {}
}
