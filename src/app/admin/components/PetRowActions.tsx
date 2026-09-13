"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Loader2 } from "lucide-react";

export function PetRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Estás seguro de que deseas eliminar esta mascota? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/pets/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Error al eliminar");
        setIsDeleting(false);
      }
    } catch (e) {
      alert("Error de conexión");
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex justify-end space-x-2">
      <Link 
        href={`/admin/pets/${id}/edit`}
        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-block" 
        title="Editar"
      >
        <Edit2 className="w-4 h-4" />
      </Link>
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" 
        title="Eliminar"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
