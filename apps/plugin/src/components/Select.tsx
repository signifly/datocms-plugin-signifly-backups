type Option = {
  label: string;
  value: string;
};

type Props = {
  id: string;
  name: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

export default function Select({ id, name, label, value, options, onChange }: Props) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
          fontSize: '0.9rem',
          backgroundColor: 'white',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
