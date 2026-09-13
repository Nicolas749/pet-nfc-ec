import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Phone, MessageCircle, Info, CalendarDays, PawPrint, Heart } from "lucide-react";

export default async function PublicPetProfile({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  const pet = await prisma.petProfile.findUnique({
    where: { slug }
  });

  if (!pet) {
    notFound();
  }

  const waLink = pet.ownerWhatsApp 
    ? `https://wa.me/${pet.ownerWhatsApp.replace(/[^0-9]/g, '')}` 
    : null;

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-800 to-indigo-900 flex justify-center pb-12 font-sans overflow-x-hidden selection:bg-indigo-300 selection:text-indigo-900">
      
      {/* Elementos decorativos de fondo flotantes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-8 left-20 w-32 h-32 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      <div className="w-full max-w-md relative sm:mt-12 z-10 px-4 sm:px-0">
        
        {/* Tarjeta Principal Flotante (Glassmorphism) */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[2.5rem] p-8 pt-12 mt-20 relative text-center">
          
          {/* Avatar Circular Sobresaliente */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2">
            <div className="relative">
              <div className="w-36 h-36 rounded-full border-4 border-white/20 shadow-[0_0_40px_rgba(99,102,241,0.5)] overflow-hidden bg-slate-800 z-10 relative flex items-center justify-center">
                {pet.photoUrl ? (
                  <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <PawPrint className="w-16 h-16 text-indigo-300 opacity-50" />
                )}
              </div>
              {/* Anillo animado que pulsa */}
              <div className="absolute inset-0 rounded-full border-4 border-indigo-400 opacity-50 animate-ping z-0"></div>
            </div>
          </div>

          <h1 className="text-4xl font-black text-white mt-8 mb-2 tracking-tight drop-shadow-lg">
            {pet.name}
          </h1>
          
          {/* Pills de Información (Raza y Edad) */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 mt-4">
            {pet.breed && (
              <span className="flex items-center px-4 py-1.5 rounded-full bg-white/10 text-indigo-100 text-sm font-semibold border border-white/10 backdrop-blur-md">
                <PawPrint className="w-4 h-4 mr-2 text-indigo-300" />
                {pet.breed}
              </span>
            )}
            {pet.age && (
              <span className="flex items-center px-4 py-1.5 rounded-full bg-white/10 text-indigo-100 text-sm font-semibold border border-white/10 backdrop-blur-md">
                <CalendarDays className="w-4 h-4 mr-2 text-fuchsia-300" />
                {pet.age}
              </span>
            )}
          </div>

          {/* Mensaje Informativo */}
          <div className="bg-slate-900/40 rounded-2xl p-4 mb-8 border border-white/10 shadow-inner flex flex-col items-center">
            <Heart className="w-6 h-6 text-fuchsia-400 mb-2" />
            <p className="text-slate-200 text-sm font-medium leading-relaxed">
              ¡Hola! Si estás leyendo esto, quizás me he perdido. Por favor, avísale a mi familia que estoy a salvo usando los botones a continuación.
            </p>
          </div>

          {/* Botones de Acción (Ultra llamativos) */}
          <div className="space-y-4">
            {pet.ownerWhatsApp && (
              <a 
                href={waLink!} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-full py-4 px-6 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-2xl font-black text-lg shadow-[0_10px_30px_-10px_rgba(37,211,102,0.8)] transition-all duration-300 hover:shadow-[0_15px_40px_-10px_rgba(37,211,102,1)] hover:-translate-y-1 active:scale-[0.97]"
              >
                <MessageCircle className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                Contactar por WhatsApp
              </a>
            )}

            {pet.ownerPhone && (
              <a 
                href={`tel:${pet.ownerPhone}`} 
                className="group flex items-center justify-center w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-black text-lg shadow-[0_10px_30px_-10px_rgba(99,102,241,0.8)] transition-all duration-300 hover:shadow-[0_15px_40px_-10px_rgba(99,102,241,1)] hover:-translate-y-1 active:scale-[0.97]"
              >
                <Phone className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                Llamar Directamente
              </a>
            )}

            {!pet.ownerWhatsApp && !pet.ownerPhone && (
               <div className="py-6 border border-dashed border-white/20 rounded-2xl">
                 <p className="text-slate-400 text-sm font-medium">Información de contacto oculta</p>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
