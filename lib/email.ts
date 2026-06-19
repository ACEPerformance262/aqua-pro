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
