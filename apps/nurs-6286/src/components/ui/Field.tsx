interface FieldProps {
  label: string;
  children: React.ReactNode;
  tooltip?: string;
}

export const Field = (props: FieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-zinc-800">{props.label}</label>
      {props.children}
    </div>
  );
};
