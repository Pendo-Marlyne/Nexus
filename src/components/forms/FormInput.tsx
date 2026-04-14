import type { HTMLInputTypeAttribute } from 'react'
import type { FieldValues, Path, UseFormRegister } from 'react-hook-form'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface FormInputProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>
  label: string
  register: UseFormRegister<TFormValues>
  type?: HTMLInputTypeAttribute
  placeholder?: string
  description?: string
  error?: string
}

export function FormInput<TFormValues extends FieldValues>({
  name,
  label,
  register,
  type = 'text',
  placeholder,
  description,
  error,
}: FormInputProps<TFormValues>) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} placeholder={placeholder} {...register(name)} />
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  )
}

