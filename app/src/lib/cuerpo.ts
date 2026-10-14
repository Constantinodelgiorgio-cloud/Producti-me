// Contenido de la sección Cuerpo: respiraciones guiadas y rutinas de estiramiento
// pensadas para alguien que entrena gimnasio y rugby, más pasos y cardio suave.

export type Fase = 'inhala' | 'sostiene' | 'exhala' | 'inhala2'
export interface Respiracion { id: string; nombre: string; para: string; cuando: string; fases: { f: Fase; s: number }[] }

export const RESPIRACIONES: Respiracion[] = [
  { id: 'suspiro', nombre: 'Suspiro fisiológico', para: 'Bajar el estrés en minutos', cuando: 'Antes de una charla difícil, después de una discusión o cuando el día se acelera.', fases: [{ f: 'inhala', s: 2 }, { f: 'inhala2', s: 1 }, { f: 'exhala', s: 6 }] },
  { id: 'caja', nombre: 'Respiración en caja', para: 'Calma y foco', cuando: 'Antes de estudiar, de un examen o de un partido.', fases: [{ f: 'inhala', s: 4 }, { f: 'sostiene', s: 4 }, { f: 'exhala', s: 4 }, { f: 'sostiene', s: 4 }] },
  { id: 'coherencia', nombre: 'Coherencia cardíaca', para: 'Recuperación', cuando: 'Después de entrenar o al llegar a casa: baja las pulsaciones.', fases: [{ f: 'inhala', s: 5.5 }, { f: 'exhala', s: 5.5 }] },
  { id: '478', nombre: '4 · 7 · 8', para: 'Dormirse más rápido', cuando: 'Ya acostado, con la luz apagada.', fases: [{ f: 'inhala', s: 4 }, { f: 'sostiene', s: 7 }, { f: 'exhala', s: 8 }] },
]
export const FASE_LABEL: Record<Fase, string> = { inhala: 'Inhalá', inhala2: 'Un poco más', sostiene: 'Sostené', exhala: 'Exhalá' }

export interface Paso { n: string; s: number; cue: string }
export interface Rutina { id: string; nombre: string; para: string; pasos: Paso[] }

const lados = (n: string, s: number, cue: string): Paso[] => [{ n: `${n} · izquierda`, s, cue }, { n: `${n} · derecha`, s, cue }]

export const RUTINAS: Rutina[] = [
  { id: 'despertar', nombre: 'Despertar', para: 'Al levantarte: columna, cadera y cuello', pasos: [
    { n: 'Gato y vaca', s: 45, cue: 'En cuatro apoyos. Redondeá la espalda al exhalar, arqueala al inhalar. Lento.' },
    ...lados('Rotación torácica', 30, 'En cuatro apoyos, mano en la nuca. Abrí el codo hacia el techo siguiéndolo con la mirada.'),
    { n: 'Círculos de cadera', s: 40, cue: 'De pie, manos en la cintura. Círculos amplios, la mitad para cada lado.' },
    { n: 'Sentadilla profunda', s: 45, cue: 'Bajá todo lo que puedas con talones apoyados. Codos empujando las rodillas hacia afuera.' },
    ...lados('Cuello lateral', 20, 'Oreja hacia el hombro, el otro hombro bien abajo. Sin forzar.'),
    { n: 'Respirar de pie', s: 30, cue: 'Brazos arriba al inhalar, bajalos al exhalar. Cinco veces.' },
  ] },
  { id: 'piernas', nombre: 'Después de piernas', para: 'Post gimnasio o rugby: isquios, cadera y gemelos', pasos: [
    ...lados('Isquiotibiales', 40, 'Sentado, una pierna estirada. Inclinate desde la cadera con la espalda larga.'),
    ...lados('Flexor de cadera', 40, 'Estocada con la rodilla de atrás apoyada. Apretá el glúteo y llevá la cadera hacia adelante.'),
    ...lados('Cuádriceps', 30, 'De pie o de costado. Talón al glúteo, rodillas juntas.'),
    ...lados('Glúteo en figura 4', 40, 'Acostado, tobillo sobre la rodilla contraria. Traé la pierna hacia el pecho.'),
    { n: 'Aductores (mariposa)', s: 45, cue: 'Sentado, plantas juntas. Espalda recta, rodillas hacia el piso sin rebotar.' },
    ...lados('Gemelos contra la pared', 30, 'Pierna de atrás estirada, talón apoyado. Inclinate hacia la pared.'),
  ] },
  { id: 'superior', nombre: 'Tren superior', para: 'Pecho, hombros y espalda alta después de empujes', pasos: [
    ...lados('Pectoral en el marco', 35, 'Antebrazo apoyado en el marco de una puerta a la altura del hombro. Girá el cuerpo hacia afuera.'),
    { n: 'Dorsal en postura del niño', s: 45, cue: 'Rodillas abiertas, brazos largos adelante. Llevá las manos hacia un lado y después al otro.' },
    ...lados('Hombro cruzado', 25, 'Brazo cruzado frente al pecho, la otra mano lo acerca desde el codo.'),
    ...lados('Tríceps', 25, 'Mano detrás de la cabeza, la otra empuja suave el codo.'),
    { n: 'Extensión torácica', s: 45, cue: 'Sobre un rodillo o el borde de la cama: abrí el pecho y dejá caer la cabeza con control.' },
    { n: 'Ángeles en la pared', s: 40, cue: 'Espalda contra la pared, brazos en W. Subí y bajá sin despegar las muñecas.' },
  ] },
  { id: 'espalda', nombre: 'Espalda baja', para: 'Después de contacto, scrum o peso muerto', pasos: [
    { n: 'Rodillas al pecho', s: 40, cue: 'Acostado boca arriba. Abrazá las rodillas y balanceate suave.' },
    ...lados('Torsión acostado', 35, 'Rodillas hacia un lado, mirada hacia el otro. Hombros apoyados.'),
    ...lados('Piriforme', 35, 'Acostado, tobillo sobre la rodilla. Tirá del muslo hacia el pecho.'),
    { n: 'Cobra suave', s: 30, cue: 'Boca abajo, apoyá los antebrazos. Subí el pecho sin apretar la zona lumbar.' },
    { n: 'Postura del niño', s: 45, cue: 'Glúteos a los talones, frente al piso. Respirá hacia la espalda baja.' },
  ] },
  { id: 'dormir', nombre: 'Antes de dormir', para: 'Bajar el ritmo y soltar el cuerpo', pasos: [
    { n: 'Postura del niño', s: 60, cue: 'Respiración lenta por la nariz. Soltá los hombros.' },
    ...lados('Torsión acostado', 40, 'Dejá caer las rodillas. Que la gravedad haga el trabajo.'),
    { n: 'Mariposa acostado', s: 45, cue: 'Boca arriba, plantas juntas, rodillas abiertas. Manos en el abdomen.' },
    { n: 'Piernas en la pared', s: 90, cue: 'Glúteos cerca de la pared, piernas arriba. Exhalaciones más largas que las inhalaciones.' },
  ] },
]
export const duracionRutina = (r: Rutina) => r.pasos.reduce((a, p) => a + p.s, 0)

export const CARDIO = ['Caminata', 'Bicicleta', 'Trote suave', 'Natación', 'Remo', 'Elíptica'] as const
