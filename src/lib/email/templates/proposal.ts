interface ProposalEmailParams {
  recipientName: string;
  subject: string;
  body: string;
  senderName?: string;
}

export function generateProposalEmail({
  recipientName,
  subject,
  body,
  senderName = "Valencia Studio",
}: ProposalEmailParams): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          border-bottom: 2px solid #7c3aed;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #7c3aed;
        }
        .content {
          white-space: pre-wrap;
        }
        .footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">${senderName}</div>
      </div>
      
      <div class="content">
        <p>Hola ${recipientName},</p>
        ${body.replace(/\n/g, "<br>")}
      </div>
      
      <div class="footer">
        <p>Este email fue enviado por ${senderName}</p>
        <p>Si no deseas recibir más emails, puedes ignorar este mensaje.</p>
      </div>
    </body>
    </html>
  `;
}

interface FollowUpEmailParams {
  recipientName: string;
  previousSubject: string;
  message: string;
  senderName?: string;
}

export function generateFollowUpEmail({
  recipientName,
  previousSubject,
  message,
  senderName = "Valencia Studio",
}: FollowUpEmailParams): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Seguimiento: ${previousSubject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          border-bottom: 2px solid #7c3aed;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #7c3aed;
        }
        .content {
          white-space: pre-wrap;
        }
        .reference {
          background: #f3f4f6;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #4b5563;
        }
        .footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">${senderName}</div>
      </div>
      
      <div class="reference">
        Re: ${previousSubject}
      </div>
      
      <div class="content">
        <p>Hola ${recipientName},</p>
        ${message.replace(/\n/g, "<br>")}
      </div>
      
      <div class="footer">
        <p>Este email fue enviado por ${senderName}</p>
        <p>Si no deseas recibir más emails, puedes ignorar este mensaje.</p>
      </div>
    </body>
    </html>
  `;
}
