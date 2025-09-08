import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const List = ({ items, onRemove, onEdit, formatItem, isEditing, editIndex, onSaveEdit, onCancelEdit }) => {
  const [editValue, setEditValue] = useState('');

  const handleEditClick = (index, item) => {
    onEdit(index, item);
    setEditValue(formatItem(item));
  };

  const handleSave = (index) => {
    onSaveEdit(index, editValue);
  };

  if (isEditing !== null) {
    return (
      <div className="edit-form">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
        />
        <button onClick={() => handleSave(editIndex)} className="icon-button">
          <FontAwesomeIcon icon={faSave} title="Guardar" />
        </button>
        <button onClick={onCancelEdit} className="icon-button">
          <FontAwesomeIcon icon={faTimes} title="Cancelar" />
        </button>
      </div>
    );
  }

  return (
    <ul className="list">
      {items.map((item, index) => (
        <li key={index} className="list-item">
          {formatItem(item)}
          <div className="list-item-actions">
            <button onClick={() => handleEditClick(index, item)} className="icon-button" title="Editar">
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button onClick={() => onRemove(index)} className="icon-button" title="Eliminar">
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default List;