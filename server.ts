/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load env variables
dotenv.config();
if (fs.existsSync(path.join(process.cwd(), '.env.local'))) {
  try {
    const envConfig = dotenv.parse(fs.readFileSync(path.join(process.cwd(), '.env.local')));
    for (const k in envConfig) {
      process.env[k] = envConfig[k];
    }
  } catch (e) {
    console.warn('[Server Setup] Error parsing .env.local file:', e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API ROADS GO HERE FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.post('/api/send-email', async (req, res) => {
    const { name, email, phone, service, service_price, date, time_slot, notes } = req.body;
    
    if (!name || !email || !service || !date || !time_slot) {
      return res.status(400).json({ error: 'Missing required appointment properties' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const businessEmail = process.env.BUSINESS_EMAIL || 'gdipesh913@gmail.com';

    if (!apiKey) {
      console.warn('[Email Handler] RESEND_API_KEY is missing from environment variables');
      return res.status(200).json({ 
        success: false,
        error: 'RESEND_API_KEY is not configured on the server. Please check your config keys.'
      });
    }

    // Set templates
    const clientSubject = `Appointment Confirmed! - BrowBliss Threading`;
    const clientHtml = `
      <div style="font-family: Georgia, serif; background-color: #FDF6F0; color: #2D2D2D; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 20px; border: 1px solid #F2C4CE;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #C4687A; font-size: 28px; margin-bottom: 5px; font-weight: normal; letter-spacing: 1px;">BrowBliss <span style="font-style: italic; color: #C9A96E;">Threading</span></h1>
          <p style="text-transform: uppercase; font-size: 10px; tracking: 2px; color: #666; margin-top: 0;">Beautiful Brows, Happy You</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border-radius: 15px; border: 1px solid rgba(196, 104, 122, 0.15); box-shadow: 0 4px 10px rgba(196, 104, 122, 0.05);">
          <h2 style="color: #2D2D2D; font-size: 20px; margin-top: 0; text-align: center; border-bottom: 1px solid #FDF6F0; padding-bottom: 15px;">Your Booking is Confirmed!</h2>
          
          <p style="font-size: 14px; line-height: 1.6; color: #4A4A4A;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4A4A4A;">Thank you for booking with BrowBliss Threading! We have saved your spot. Here are your booking details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr>
              <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #FDF6F0; width: 35%;">Service:</td>
              <td style="padding: 10px 0; font-weight: bold; color: #2D2D2D; border-bottom: 1px solid #FDF6F0;">${service}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #FDF6F0;">Price:</td>
              <td style="padding: 10px 0; font-weight: bold; color: #C4687A; border-bottom: 1px solid #FDF6F0;">$${service_price}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #FDF6F0;">Date:</td>
              <td style="padding: 10px 0; font-weight: bold; color: #2D2D2D; border-bottom: 1px solid #FDF6F0;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #FDF6F0;">Time Slot:</td>
              <td style="padding: 10px 0; font-weight: bold; color: #2D2D2D; border-bottom: 1px solid #FDF6F0;">${time_slot}</td>
            </tr>
            ${notes ? `
            <tr>
              <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #FDF6F0;">Special Notes:</td>
              <td style="padding: 10px 0; font-style: italic; color: #555; border-bottom: 1px solid #FDF6F0;">"${notes}"</td>
            </tr>` : ''}
          </table>

          <div style="background-color: #FDF6F0; border-left: 4px solid #C9A96E; padding: 15px; margin-top: 25px; border-radius: 4px;">
            <h4 style="margin: 0 0 5px 0; color: #C9A96E; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">📍 Private Studio Address</h4>
            <p style="margin: 0; font-size: 14px; line-height: 1.5; font-weight: bold; color: #2D2D2D;">
              BrowBliss Threading<br/>
              312 West Beamer St<br/>
              Woodland, CA 95695
            </p>
            <p style="margin: 8px 0 0 0; font-size: 12px; font-style: italic; color: #666; line-height: 1.4;">
              *Conveniently located in a quiet tree-lined resident part of Woodland. Free street parking is readily available right in front of the house studio. Please ring the doorbell upon arrival so we can greet you in!*
            </p>
          </div>
          
          <div style="margin-top: 25px; font-size: 13px; line-height: 1.6; color: #666; border-top: 1px solid #FDF6F0; padding-top: 15px;">
            <p style="margin: 0 0 5px 0;"><strong>Need to Cancel or Reschedule?</strong></p>
            <p style="margin: 0;">Please call or text us at least 2 hours in advance at <a href="tel:530-867-2298" style="color: #C4687A; font-weight: bold; text-decoration: none;">530-867-2298</a>. Thank you for your support!</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 25px; font-size: 11px; color: #999;">
          <p>© ${new Date().getFullYear()} BrowBliss Threading. All rights reserved.</p>
        </div>
      </div>
    `;

    const ownerSubject = `New Appointment Booking Alert! - ${name}`;
    const ownerHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #F2C4CE; max-width: 600px; border-radius: 12px; background-color: #FDF6F0;">
        <h2 style="color: #C4687A; margin-top: 0;">New Appointment Booked!</h2>
        <p>A new threading session request has been registered in the calendar scheduler:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 6px; font-weight: bold; width: 30%;">Client Name:</td>
            <td style="padding: 6px;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold;">Client Email:</td>
            <td style="padding: 6px;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold;">Client Phone:</td>
            <td style="padding: 6px;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold;">Treatment:</td>
            <td style="padding: 6px;">${service} ($${service_price})</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold;">Date:</td>
            <td style="padding: 6px; color: #C4687A; font-weight: bold;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold;">Time Slot:</td>
            <td style="padding: 6px; color: #C4687A; font-weight: bold;">${time_slot}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold;">Notes:</td>
            <td style="padding: 6px; font-style: italic;">${notes || 'None'}</td>
          </tr>
        </table>
        <p style="font-size: 12px; color: #888;">Please log in to your BrowBliss Dashboard to manage appointments.</p>
      </div>
    `;

    try {
      let clientSent = false;
      let clientError = null;
      let ownerSent = false;
      let ownerError = null;

      // 1. Try sending client confirmation
      try {
        const clientRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            from: 'BrowBliss Threading <onboarding@resend.dev>',
            to: [email],
            subject: clientSubject,
            html: clientHtml
          })
        });
        const clientData = await clientRes.json() as any;
        if (clientRes.ok) {
          clientSent = true;
        } else {
          clientError = clientData;
        }
      } catch (e: any) {
        clientError = e?.message || e;
      }

      // 2. Try sending owner details alert
      try {
        const ownerRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            from: 'BrowBliss Threading <onboarding@resend.dev>',
            to: [businessEmail],
            subject: ownerSubject,
            html: ownerHtml
          })
        });
        const ownerData = await ownerRes.json() as any;
        if (ownerRes.ok) {
          ownerSent = true;
        } else {
          ownerError = ownerData;
        }
      } catch (e: any) {
        ownerError = e?.message || e;
      }

      // If both failed, report failure
      if (!clientSent && !ownerSent) {
        return res.status(200).json({
          success: false,
          error: 'Resend API rejected the credentials or onboarding restraints.',
          details: clientError || ownerError
        });
      }

      return res.status(200).json({
        success: true,
        clientSent,
        ownerSent,
        warning: (!clientSent) ? 'Resend sandbox trial mode bypassed sending to client address because domain is unverified. Sent confirmation only to verified business host.' : undefined
      });

    } catch (apiErr: any) {
      console.error('[Email Dispatch] Transaction Error:', apiErr);
      return res.status(500).json({
        success: false,
        error: apiErr?.message || apiErr
      });
    }
  });

  // Serve static assets or mount Vite dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BrowBliss Server] Running full-stack environment at http://localhost:${PORT}`);
  });
}

startServer();
