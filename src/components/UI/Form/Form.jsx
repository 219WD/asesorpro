// components/UI/Form/Form.js
import React from 'react';

const Form = ({ onSubmit, fields, buttonText }) => {
  return (
    <form onSubmit={onSubmit} className="form">
      {fields.map((field, index) => {
        if (field.type === 'select') {
          return (
            <select
              key={index}
              value={field.value}
              onChange={field.onChange}
            >
              {field.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        }
        
        return (
          <input
            key={index}
            type={field.type}
            placeholder={field.placeholder}
            value={field.value}
            onChange={field.onChange}
            required={field.required}
          />
        );
      })}
      <button type="submit">{buttonText}</button>
    </form>
  );
};

export default Form;