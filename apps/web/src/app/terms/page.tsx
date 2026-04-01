import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Términos y Condiciones | Parkit",
  description: "Términos y condiciones de Parkit",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-page text-text-primary">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-block mb-8">
            <Logo variant="default" width={120} height={40} />
          </Link>
          <h1 className="text-4xl font-bold mb-2">Términos y Condiciones</h1>
          <p className="text-text-secondary">Última actualización: 31 de marzo de 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Aceptación de Términos</h2>
            <p className="text-text-secondary leading-relaxed">
              Al acceder y utilizar Parkit, aceptas estar vinculado por estos Términos y Condiciones. 
              Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Licencia de Uso</h2>
            <p className="text-text-secondary leading-relaxed">
              Se te otorga una licencia limitada, no exclusiva y revocable para usar Parkit para sus 
              propósitos previstos. No puedes reproducir, distribuir o transmitir el contenido sin 
              nuestro consentimiento previo por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Responsabilidad del Usuario</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Eres responsable de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
              <li>Mantener la confidencialidad de tus credenciales de acceso</li>
              <li>Toda actividad que ocurra bajo tu cuenta</li>
              <li>Cumplir con todas las leyes y regulaciones aplicables</li>
              <li>No usar Parkit para actividades ilegales o no autorizadas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Limitación de Responsabilidad</h2>
            <p className="text-text-secondary leading-relaxed">
              Parkit se proporciona &quot;tal como está&quot; sin garantías de ningún tipo. En la máxima medida 
              permitida por la ley, no seremos responsables por daños indirectos, incidentales, especiales 
              o consecuentes que surjan del uso o la imposibilidad de usar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Modificaciones del Servicio</h2>
            <p className="text-text-secondary leading-relaxed">
              Nos reservamos el derecho de modificar, suspender o descontinuar cualquier parte de Parkit 
              en cualquier momento sin previo aviso. No seremos responsables ante ti ni ante terceros 
              por cualquier modificación o discontinuación del servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Pago y Facturación</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Al usar nuestros servicios de pago:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
              <li>Garantizas que tienes autoridad legal para usar el método de pago proporcionado</li>
              <li>Autorizas el cobro de los cargos acordados</li>
              <li>Las facturas se emitirán según la configuración de tu cuenta</li>
              <li>Los reembolsos están sujetos a nuestra política de reembolsos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Contenido y Conducta</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              No debes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
              <li>Publicar contenido ofensivo, discriminatorio o ilegal</li>
              <li>Intentar obtener acceso no autorizado a Parkit</li>
              <li>Interferir con el funcionamiento normal del servicio</li>
              <li>Recabar o scraping de datos sin autorización</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Rescisión</h2>
            <p className="text-text-secondary leading-relaxed">
              Podemos rescindir u suspender tu cuenta inmediatamente, sin aviso previo, si violas 
              estos Términos y Condiciones o por cualquier motivo a nuestro exclusivo criterio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Ley Aplicable</h2>
            <p className="text-text-secondary leading-relaxed">
              Estos Términos y Condiciones se rigen e interpretan de conformidad con las leyes de la 
              jurisdicción en la que opera Parkit, sin considerar sus principios de conflicto de leyes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Contacto</h2>
            <p className="text-text-secondary leading-relaxed">
              Si tienes preguntas sobre estos Términos y Condiciones, contáctanos en:
              <br />
              <strong>Email:</strong> legal@parkit.com
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
