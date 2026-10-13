"use server";

import { Resend } from 'resend';
import { siteConfig } from '@/config/site';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

type ContactFormData = {
  name: string;
  email: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
};

export async function sendContactEmail(formData: ContactFormData) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not found. Simulating email sending...");
      return { success: true, message: "Simulated success (No API key)" };
    }

    const { name, email, service, budget, timeline, message } = formData;

    const data = await resend.emails.send({
      from: `${siteConfig.shortName} Contact <onboarding@resend.dev>`,
      to: siteConfig.contact.email,
      subject: `Nuevo Lead: ${service} - ${name}`,
      html: `
        <h2>Nueva Ficha de Levantamiento</h2>
        <p><strong>Nombre/Empresa:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Servicio:</strong> ${service}</p>
        <p><strong>Presupuesto:</strong> ${budget}</p>
        <p><strong>Plazo:</strong> ${timeline}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email", error);
    return { success: false, error: "Failed to send email" };
  }
}
