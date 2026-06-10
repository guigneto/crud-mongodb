import { Pencil, Trash2 } from 'lucide-react'

interface Props {
  onEdit: (e?: React.MouseEvent) => void
  onDelete: (e?: React.MouseEvent) => void
}

export default function TableActions({ onEdit, onDelete }: Props) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  return (
    <div className="flex justify-end gap-1">
      <button onClick={handleEdit} title="Editar" className="text-gray-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors"><Pencil size={15} /></button>
      <button onClick={handleDelete} title="Excluir" className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
    </div>
  )
}
