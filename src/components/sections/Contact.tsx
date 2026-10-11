"use client";

import { useState } from "react";
import { Mail, MapPin, MessageSquareText, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig, features } from "@/config/site";
import { sendContactEmail } from "@/app/actions/contact";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!features.enableContactWizard) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await sendContactEmail({
        service: formData.service,
        budget: "A definir",
        timeline: "A definir",
        name: formData.name,
        email: "",
        message: `${formData.message} | Teléfono: ${formData.phone}`,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      setIsSubmitted(true);
    }
  };

  const services = [
    "Hogar Seguro",
    "Puesta a Punto Legal",
    "Pyme Tranquila",
    "Atención urgente",
    "Otro servicio",
  ];

  return (
    <section id="contacto" className="py-20 relative bg-background/80 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Agenda tu <span className="text-gradient">diagnóstico</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Escríbenos por WhatsApp o completa este formulario y te responderemos con una solución clara, sin sorpresa ni complicaciones.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary-light" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">WhatsApp</div>
                  <div className="font-medium">{siteConfig.contact.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-light" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Ubicación</div>
                  <div className="font-medium">{siteConfig.contact.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary-light" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Correo</div>
                  <div className="font-medium">{siteConfig.contact.email}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="bg-white/5 p-8 rounded-2xl border border-white/10">
                <div className="mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquareText className="w-5 h-5 text-primary-light" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Solicita tu diagnóstico</div>
                    <h3 className="text-xl font-semibold text-white">Cuéntanos qué necesitas</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Nombre</label>
                    <Input
                      type="text"
                      placeholder="Tu nombre o empresa"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Teléfono</label>
                    <Input
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Servicio</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white outline-none ring-0 focus:border-primary"
                      required
                    >
                      <option value="">Selecciona una opción</option>
                      {services.map((service) => (
                        <option key={service} value={service} className="text-black">
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Mensaje</label>
                    <Textarea
                      placeholder="Describe el problema, equipo o necesidad que tienes..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="mt-6 w-full" size="lg">
                  Enviar solicitud
                </Button>
              </form>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquareText className="h-6 w-6 text-primary-light" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">¡Gracias por contactarnos!</h3>
                <p className="text-gray-300">
                  Revisaremos tu solicitud y te responderemos a la brevedad para agendar tu diagnóstico.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
