import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Política de Privacidad | Parkit",
  description: "Política de privacidad de Parkit",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-page text-text-primary">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-block mb-8">
            <Logo variant="default" width={120} height={40} />
          </Link>
          <h1 className="text-4xl font-bold mb-2">Política de Privacidad</h1>
          <p className="text-text-secondary">Última actualización: 31 de marzo de 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introducción</h2>
            <p className="text-text-secondary leading-relaxed">
              En Parkit, nos comprometemos a proteger tu privacidad. Esta Política de Privacidad 
              explica cómo recopilamos, usamos, divulgamos y salvaguardamos tu información cuando 
              utilizas nuestra plataforma de gestión de estacionamientos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Información que Recopilamos</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Recopilamos información de varias formas:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
              <li>Información de registro: nombre, correo electrónico, teléfono, empresa</li>
              <li>Información de vehículo: placa, modelo, color, tipo</li>
              <li>Datos de estacionamiento: ubicaciones, horarios, tarifas</li>
              <li>Información de transacción: pagos, historial de reservas</li>
              <li>Datos de dispositivo: IP, navegador, tipo de dispositivo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Cómo Utilizamos tu Información</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
              <li>Proporcionar y mejorar nuestros servicios</li>
              <li>Procesar transacciones y enviar notificaciones relacionadas</li>
              <li>Enviar actualizaciones, ofertas y comunicaciones de marketing</li>
              <li>Detectar, prevenir y abordar fraude</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Seguridad de Datos</h2>
            <p className="text-text-secondary leading-relaxed">
              Implementamos medidas de seguridad técnicas, administrativas y físicas apropiadas para 
              proteger tu información personal contra acceso no autorizado, alteración y destrucción.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Tus Derechos</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
              <li>Acceder a tus datos personales</li>
              <li>Corregir información inexacta</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Oponersi al procesamiento de tus datos</li>
              <li>Solicitar la portabilidad de datos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Contacto</h2>
            <p className="text-text-secondary leading-relaxed">
              Si tienes preguntas sobre esta Política de Privacidad, contáctanos en:
              <br />
              <strong>Email:</strong> privacy@parkit.com
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/" className="text-primary hover:text-primary-focus">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
