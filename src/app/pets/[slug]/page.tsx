import { PetRepository } from "@/repositories/PetRepository";
import { PetService } from "@/services/PetService";
import { notFound } from "next/navigation";
import { PawPrint } from "lucide-react";
import PetProfileCard, { Theme } from "./PetProfileCard";

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

export default async function PublicPetProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const petRepository = new PetRepository();
  const petService = new PetService(petRepository);
  
  const pet = await petService.getPetBySlug(slug);

  if (!pet) {
    notFound();
  }

  const isMale = pet.gender === "macho";

  // Paleta de colores dinámica (Morado por defecto o hembra, Celeste para machos)
  const bg = isMale ? "bg-[#5BA4C3]" : "bg-[#9D68A8]";
  const theme: Theme = {
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
    tabTrack: isMale ? "bg-[#D0EBF4]" : "bg-[#E2D4E6]",
    tabActive: isMale ? "bg-white text-[#3B5461]" : "bg-white text-[#4A3B52]",
    tabInactive: isMale ? "text-[#587B8A] hover:text-[#3B5461]" : "text-[#6B5A74] hover:text-[#4A3B52]",
    infoBg: isMale ? "bg-[#D0EBF4]/70" : "bg-[#E2D4E6]/70",
    infoIcon: isMale ? "text-[#5BA4C3]" : "text-[#9D68A8]",
  };

  return (
    <div className={`min-h-screen ${bg} flex flex-col justify-end relative mx-auto overflow-hidden font-sans sm:max-w-md sm:border-x sm:border-white/10 sm:shadow-2xl transition-colors duration-500`}>
      
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
      <PetProfileCard
        theme={theme}
        pet={{
          name: pet.name,
          breed: pet.breed,
          age: pet.age,
          gender: pet.gender,
          ownerPhone: pet.ownerPhone,
          ownerWhatsApp: pet.ownerWhatsApp,
          isAggressive: pet.isAggressive,
          allergies: pet.allergies,
          medicalNotes: pet.medicalNotes,
          careNotes: pet.careNotes,
          vetName: pet.vetName,
          vetPhone: pet.vetPhone,
          vetUrl: pet.vetUrl,
        }}
      />
    </div>
  );
}
