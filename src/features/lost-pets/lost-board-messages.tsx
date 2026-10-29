import { PetDetail } from '@/features/brand/pet-note';

export function LostBoardMessages() {
  return <section className="lost-encouragement" aria-label="Cada pista puede ayudar">
    <div><PetDetail kind="heart" /><div><h2>Para quienes esperan su regreso</h2><p>Sabemos cuánto la extrañas. Su foto, tus contactos y cada detalle que compartes pueden ayudar a acercarla a casa.</p></div></div>
    <div><PetDetail kind="dog" /><div><h2>Una pista tuya puede cambiar su día</h2><p>¿Te resulta familiar alguna de estas caritas? Abre su ficha y escribe por WhatsApp a su familia. Tu mensaje puede ser el comienzo del reencuentro.</p></div></div>
  </section>;
}
