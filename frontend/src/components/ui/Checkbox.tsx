import * as React from "react";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", onCheckedChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(props.checked || false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setIsChecked(checked);
      onCheckedChange?.(checked);
    };

    return (
      <div className="relative inline-flex">
        <input
          ref={ref}
          type="checkbox"
          className="peer sr-only"
          onChange={handleChange}
          {...props}
        />
        <div className={`h-4 w-4 shrink-0 rounded-sm border border-[--border] bg-[--surface] ring-offset-[--surface] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 peer-checked:bg-[--accent] peer-checked:text-white flex items-center justify-center ${className}`}>
          {(isChecked || props.checked) && <Check className="h-3 w-3" />}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
