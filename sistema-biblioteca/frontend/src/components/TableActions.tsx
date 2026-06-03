import { Pencil, Trash2 } from 'lucide-react'

interface Props {
  onEdit: () => void
  onDelete: () => void
}

export default function TableActions({ onEdit, onDelete }: Props) {
  return (
    <div className="flex justify-end gap-1">
      <button onClick={onEdit}   title="Editar"  className="text-gray-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors"><Pencil  size={15} /></button>
      <button onClick={onDelete} title="Excluir" className="text-gray-400 hover:text-red-600   p-1.5 rounded-full hover:bg-red-50  transition-colors"><Trash2  size={15} /></button>
    </div>
  )
}
