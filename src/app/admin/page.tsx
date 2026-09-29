import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, QrCode } from "lucide-react";
import { PetRowActions } from "./components/PetRowActions";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const pets = await prisma.petProfile.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Perfiles de Mascotas</h1>
          <p className="text-gray-500 mt-1">Gestiona los perfiles vinculados a las placas NFC.</p>
        </div>

        <Link
          href="/admin/pets/new"
          className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Perfil
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Mascota</th>
                <th className="px-6 py-4">Raza</th>
                <th className="px-6 py-4">Enlace (NFC Slug)</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <PawPrintIcon className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-base font-medium text-gray-900">No hay perfiles aún</p>
                      <p className="text-sm mt-1">Comienza creando el primer perfil para una mascota.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pets.map((pet: any) => (
                  <tr key={pet.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                      {pet.photoUrl ? (
                        <img src={pet.photoUrl} alt={pet.name} className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-bold text-lg">
                          {pet.name.charAt(0)}
                        </div>
                      )}
                      {pet.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{pet.breed || "-"}</td>
                    <td className="px-6 py-4">
                      <Link href={`/pets/${pet.slug}`} target="_blank" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        <QrCode className="w-4 h-4 mr-1.5" />
                        /pets/{pet.slug}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <PetRowActions id={pet.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PawPrintIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="20" cy="16" r="2" />
      <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
    </svg>
  )
}
