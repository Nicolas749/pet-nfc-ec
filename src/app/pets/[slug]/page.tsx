import { PetRepository } from "@/repositories/PetRepository";
import { PetService } from "@/services/PetService";
import { notFound } from "next/navigation";
import { Phone, MessageCircle, PawPrint, Heart } from "lucide-react";

function BackgroundPaws() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <PawPrint className="absolute top-12 left-6 w-8 h-8 text-white opacity-80 rotate-[-20deg]" />
      <PawPrint className="absolute top-4 right-10 w-10 h-10 text-white opacity-80 rotate-[15deg]" />
      <PawPrint className="absolute top-1/3 left-8 w-6 h-6 text-white opacity-80 rotate-[10deg]" />
      <PawPrint className="absolute top-[40%] right-6 w-8 h-8 text-white opacity-80 rotate-[-15deg]" />
      <PawPrint className="absolute top-2/3 right-4 w-10 h-10 text-white opacity-80 rotate-[25deg]" />
      <PawPrint className="absolute top-[75%] left-10 w-6 h-6 text-white opacity-80 rotate-[-10deg]" />
    </div>
  );
}

export default async function PublicPetProfile({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  const petRepository = new PetRepository();
  const petService = new PetService(petRepository);
  
  const pet = await petService.getPetBySlug(slug);

  if (!pet) {
    notFound();
  }

  const waLink = pet.ownerWhatsApp 
    ? `https://wa.me/${pet.ownerWhatsApp.replace(/[^0-9]/g, '')}` 
    : null;

  const isMale = pet.gender === "macho";

  // Paleta de colores dinámica (Morado por defecto o hembra, Celeste para machos)
  const theme = {
    bg: isMale ? "bg-[#5BA4C3]" : "bg-[#9D68A8]",
    card: isMale ? "bg-[#E6F4F9]" : "bg-[#F3E8F6]",
    title: isMale ? "text-[#3B5461]" : "text-[#4A3B52]",
    pillBg: isMale ? "bg-[#D0EBF4]" : "bg-[#E2D4E6]",
    pillText: isMale ? "text-[#587B8A]" : "text-[#6B5A74]",
    textP: isMale ? "text-[#7093A3]" : "text-[#84738C]",
    primaryBtn: isMale ? "bg-[#5BA4C3]" : "bg-[#9D68A8]",
    primaryBtnHover: isMale ? "hover:bg-[#4A8CA8]" : "hover:bg-[#8A5795]",
    secondaryBtnText: isMale ? "text-[#5BA4C3]" : "text-[#9D68A8]",
    secondaryBtnBorder: isMale ? "border-[#5BA4C3]" : "border-[#9D68A8]",
    secondaryBtnHoverBg: isMale ? "hover:bg-[#5BA4C3]" : "hover:bg-[#9D68A8]",
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col justify-end relative mx-auto overflow-hidden font-sans sm:max-w-md sm:border-x sm:border-white/10 sm:shadow-2xl transition-colors duration-500`}>
      
      {/* Patitas de fondo */}
      <BackgroundPaws />

      {/* Imagen Superior */}
      <div className="relative z-10 flex flex-col items-center justify-end flex-grow pt-12 px-6">
        {pet.photoUrl ? (
          <img 
            src={pet.photoUrl} 
            alt={pet.name} 
            className="w-full max-w-[260px] max-h-[320px] object-contain drop-shadow-2xl translate-y-10" 
          />
        ) : (
          <div className="w-56 h-56 bg-white/20 rounded-[3rem] flex items-center justify-center translate-y-10 drop-shadow-2xl border-4 border-white/40 backdrop-blur-sm">
            <PawPrint className="w-24 h-24 text-white opacity-80" />
          </div>
        )}
      </div>

      {/* Tarjeta Inferior */}
      <div className={`${theme.card} w-full rounded-t-[2.5rem] px-8 pt-16 pb-12 z-20 flex flex-col items-center text-center shadow-[0_-15px_40px_rgba(0,0,0,0.15)] transition-colors duration-500`}>
        
        <h1 className={`text-[1.75rem] font-serif font-bold ${theme.title} mb-3 leading-tight`}>
          ¡Hola! Soy {pet.name}
        </h1>
        
        {/* Pills de Información (Raza y Edad) - Opcionales */}
        {(pet.breed || pet.age || pet.gender) && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {pet.breed && (
              <span className={`px-3 py-1 ${theme.pillBg} ${theme.pillText} text-xs font-bold rounded-full uppercase tracking-wider`}>
                {pet.breed}
              </span>
            )}
            {pet.age && (
              <span className={`px-3 py-1 ${theme.pillBg} ${theme.pillText} text-xs font-bold rounded-full uppercase tracking-wider`}>
                {pet.age}
              </span>
            )}
            {pet.gender && (
              <span className={`px-3 py-1 ${theme.pillBg} ${theme.pillText} text-xs font-bold rounded-full uppercase tracking-wider`}>
                {pet.gender}
              </span>
            )}
          </div>
        )}

        <p className={`${theme.textP} text-[0.95rem] font-medium leading-relaxed mb-8 max-w-[280px]`}>
          Si estás leyendo esto, quizás me he perdido. Por favor, avísale a mi familia que estoy a salvo usando los botones a continuación.
        </p>

        <div className="w-full flex flex-col gap-3">
          {pet.ownerWhatsApp && (
            <a 
              href={waLink!} 
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

          {!pet.ownerWhatsApp && !pet.ownerPhone && (
             <div className="py-4 border-2 border-dashed border-[#84738C]/30 rounded-[1.5rem]">
               <p className={`${theme.textP} text-sm font-medium`}>Información de contacto oculta</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
