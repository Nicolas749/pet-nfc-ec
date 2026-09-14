"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, UploadCloud } from "lucide-react";

export default function NewPetProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Check for file upload
    const file = formData.get("photoFile") as File;
    let photoUrl = "";

    try {
      if (file && file.size > 0) {
        // Upload to Vercel Blob
        const uploadRes = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error("No se pudo subir la imagen.");
        }

        const blob = await uploadRes.json();
        photoUrl = blob.url;
      }

      // Prepare final data
      delete data.photoFile; // Remove file object before sending JSON
      if (photoUrl) {
        data.photoUrl = photoUrl;
      }

      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error && typeof result.error === 'object' && result.error.fieldErrors) {
          const firstError = Object.values(result.error.fieldErrors)[0] as string[];
          setError(firstError[0] || "Error de validación");
        } else {
          setError(result.error || "Error al crear el perfil");
        }
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link href="/admin" className="p-2 mr-4 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Perfil de Mascota</h1>
          <p className="text-gray-500 text-sm">Completa los datos para el tag NFC.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Foto de la Mascota</label>
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      Sube un archivo
                    </span>
                    <p className="pl-1">o arrástralo y suéltalo</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP hasta 4.5MB</p>
                </div>
              </div>
              <input 
                type="file" 
                id="photoFile" 
                name="photoFile" 
                ref={fileInputRef}
                accept="image/jpeg, image/png, image/webp"
                className="hidden" 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre de la Mascota *</label>
              <input required type="text" id="name" name="name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" placeholder="Ej. Firulais" />
            </div>

            <div className="space-y-2">
              <label htmlFor="breed" className="block text-sm font-medium text-gray-700">Raza</label>
              <input type="text" id="breed" name="breed" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" placeholder="Ej. Golden Retriever" />
            </div>

            <div className="space-y-2">
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">Edad</label>
              <input type="text" id="age" name="age" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" placeholder="Ej. 2 años" />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Identificador URL (Slug) *</label>
              <div className="flex items-center">
                <span className="px-4 py-2.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">/pets/</span>
                <input required type="text" id="slug" name="slug" pattern="[a-z0-9-]+" className="flex-1 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" placeholder="firulais-123" />
              </div>
              <p className="text-xs text-gray-400">Solo minúsculas, números y guiones. Es lo que se grabará en el NFC.</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <h3 className="text-lg font-medium text-gray-900">Datos de Contacto del Dueño</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="ownerPhone" className="block text-sm font-medium text-gray-700">Teléfono (Llamadas)</label>
              <input type="tel" id="ownerPhone" name="ownerPhone" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" placeholder="+34 600 000 000" />
            </div>

            <div className="space-y-2">
              <label htmlFor="ownerWhatsApp" className="block text-sm font-medium text-gray-700">WhatsApp</label>
              <input type="tel" id="ownerWhatsApp" name="ownerWhatsApp" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" placeholder="+34600000000" />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Link href="/admin" className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors mr-3">
              Cancelar
            </Link>
            <button disabled={loading} type="submit" className="inline-flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all hover:shadow hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Crear Perfil
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
