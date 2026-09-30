"use client";

import { useState } from "react";
import { Phone, MessageCircle, HeartPulse, AlertTriangle, ShieldCheck, Pill, Stethoscope, Sparkles, Hospital, ExternalLink } from "lucide-react";

export type PublicPet = {
  name: string;
  breed: string | null;
  age: string | null;
  gender: string | null;
  ownerPhone: string | null;
  ownerWhatsApp: string | null;
  isAggressive: boolean;
  allergies: string | null;
  medicalNotes: string | null;
  careNotes: string | null;
  vetName: string | null;
  vetPhone: string | null;
  vetUrl: string | null;
};

export type Theme = {
  card: string;
  title: string;
  pillBg: string;
  pillText: string;
  textP: string;
  primaryBtn: string;
  primaryBtnHover: string;
  secondaryBtnText: string;
  secondaryBtnBorder: string;
  secondaryBtnHoverBg: string;
  tabActive: string;
  tabInactive: string;
  tabTrack: string;
  infoBg: string;
  infoIcon: string;
};

type Tab = "contact" | "care";

function InfoRow({ icon: Icon, label, value, theme }: { icon: typeof Pill; label: string; value: string; theme: Theme }) {
  return (
    <div className={`flex items-start gap-3 p-4 ${theme.infoBg} rounded-2xl text-left`}>
      <div className={`shrink-0 w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center ${theme.infoIcon}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className={`text-[0.7rem] font-bold uppercase tracking-wider ${theme.pillText}`}>{label}</p>
        <p className={`text-sm font-medium leading-relaxed ${theme.title} whitespace-pre-line break-words`}>{value}</p>
      </div>
    </div>
  );
}

export default function PetProfileCard({ pet, theme }: { pet: PublicPet; theme: Theme }) {
  const [tab, setTab] = useState<Tab>("contact");

  const waLink = pet.ownerWhatsApp ? `https://wa.me/${pet.ownerWhatsApp.replace(/[^0-9]/g, "")}` : null;
  const hasVet = !!(pet.vetName || pet.vetPhone || pet.vetUrl);
  const hasCareInfo = !!(pet.allergies || pet.medicalNotes || pet.careNotes || pet.isAggressive || hasVet);

  const tabs: { id: Tab; label: string; icon: typeof Phone }[] = [
    { id: "contact", label: "Contacto", icon: Phone },
    { id: "care", label: "Cuidados", icon: HeartPulse },
  ];

  return (
    <div className={`${theme.card} w-full rounded-t-[2.5rem] px-6 pt-16 pb-10 z-20 flex flex-col items-center text-center shadow-[0_-15px_40px_rgba(0,0,0,0.15)] transition-colors duration-500`}>
      <h1 className={`text-[1.75rem] font-serif font-bold ${theme.title} mb-3 leading-tight`}>
        ¡Hola! Soy {pet.name}
      </h1>

      {(pet.breed || pet.age || pet.gender) && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {[pet.breed, pet.age, pet.gender].filter(Boolean).map((v) => (
            <span key={v} className={`px-3 py-1 ${theme.pillBg} ${theme.pillText} text-xs font-bold rounded-full uppercase tracking-wider`}>
              {v}
            </span>
          ))}
        </div>
      )}

      {pet.isAggressive && (
        <div className="w-full flex items-center gap-3 p-3.5 mb-4 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl text-left">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <p className="text-sm font-semibold leading-snug">Puedo reaccionar de forma agresiva. Por favor acércate con calma y precaución.</p>
        </div>
      )}

      {/* Tabs */}
      <div role="tablist" aria-label="Información de la mascota" className={`w-full grid grid-cols-2 p-1 mb-5 ${theme.tabTrack} rounded-2xl`}>
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls={`panel-${id}`}
              onClick={() => setTab(id)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${active ? `${theme.tabActive} shadow-md` : theme.tabInactive}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {tab === "contact" && (
        <div id="panel-contact" role="tabpanel" className="w-full">
          <p className={`${theme.textP} text-[0.95rem] font-medium leading-relaxed mb-6 max-w-[280px] mx-auto`}>
            Si estás leyendo esto, quizás me he perdido. Por favor, avísale a mi familia que estoy a salvo.
          </p>

          <div className="w-full flex flex-col gap-3">
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center w-full py-4 px-6 ${theme.primaryBtn} text-white rounded-[1.5rem] font-bold text-lg shadow-lg ${theme.primaryBtnHover} hover:scale-[1.02] active:scale-95 transition-all`}
              >
                Contactar por WhatsApp
                <MessageCircle className="w-5 h-5 ml-2" />
              </a>
            )}

            {pet.ownerPhone && (
              <a
                href={`tel:${pet.ownerPhone}`}
                className={`flex items-center justify-center w-full py-4 px-6 border-2 ${theme.secondaryBtnBorder} ${theme.secondaryBtnText} rounded-[1.5rem] font-bold text-lg ${theme.secondaryBtnHoverBg} hover:text-white hover:scale-[1.02] active:scale-95 transition-all bg-transparent`}
              >
                Llamar a mi dueño
                <Phone className="w-5 h-5 ml-2" />
              </a>
            )}

            {!waLink && !pet.ownerPhone && (
              <div className="py-4 border-2 border-dashed border-current/20 rounded-[1.5rem]">
                <p className={`${theme.textP} text-sm font-medium`}>Información de contacto oculta</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "care" && (
        <div id="panel-care" role="tabpanel" className="w-full flex flex-col gap-3">
          {pet.allergies && <InfoRow icon={Pill} label="Alergias" value={pet.allergies} theme={theme} />}
          {pet.medicalNotes && <InfoRow icon={Stethoscope} label="Salud y medicación" value={pet.medicalNotes} theme={theme} />}
          {pet.careNotes && <InfoRow icon={Sparkles} label="Cuidados importantes" value={pet.careNotes} theme={theme} />}

          {hasVet && (
            <div className={`p-4 ${theme.infoBg} rounded-2xl text-left`}>
              <div className="flex items-start gap-3">
                <div className={`shrink-0 w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center ${theme.infoIcon}`}>
                  <Hospital className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className={`text-[0.7rem] font-bold uppercase tracking-wider ${theme.pillText}`}>Mi veterinaria</p>
                  <p className={`text-sm font-medium leading-relaxed ${theme.title} break-words`}>{pet.vetName || "Veterinaria de confianza"}</p>
                </div>
              </div>
              {(pet.vetPhone || pet.vetUrl) && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {pet.vetPhone && (
                    <a
                      href={`tel:${pet.vetPhone}`}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/80 ${theme.secondaryBtnText} rounded-xl text-sm font-bold hover:bg-white active:scale-95 transition-all ${!pet.vetUrl ? "col-span-2" : ""}`}
                    >
                      <Phone className="w-4 h-4" />
                      Llamar
                    </a>
                  )}
                  {pet.vetUrl && (
                    <a
                      href={pet.vetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/80 ${theme.secondaryBtnText} rounded-xl text-sm font-bold hover:bg-white active:scale-95 transition-all ${!pet.vetPhone ? "col-span-2" : ""}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver enlace
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {!hasCareInfo && (
            <div className={`flex flex-col items-center gap-2 py-8 ${theme.textP}`}>
              <ShieldCheck className="w-10 h-10 opacity-70" />
              <p className="text-sm font-medium max-w-[240px]">No tengo alergias ni cuidados especiales registrados. ¡Soy fácil de cuidar!</p>
            </div>
          )}

          {hasCareInfo && !pet.allergies && !pet.medicalNotes && !pet.careNotes && !hasVet && (
            <p className={`${theme.textP} text-sm font-medium py-4`}>Sin alergias ni cuidados adicionales registrados.</p>
          )}
        </div>
      )}
    </div>
  );
}
