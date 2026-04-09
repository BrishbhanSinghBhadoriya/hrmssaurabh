"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Employee, User } from '@/lib/types';
import { mockDepartments, mockDesignations, mockEmployees } from '@/lib/mock';

const employeeSchema = z.object({
  username: z.string().optional().or(z.literal('')),
  password : z.string().optional().or(z.literal('')),
  name: z.string().optional().or(z.literal('')),
  email: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  emergencyContactNo: z.string().optional().or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
  role: z.string().optional().or(z.literal('')),
  designation: z.string().optional().or(z.literal('')),
  joiningDate: z.string().optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
}); 


type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: User;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee ? {
      username:employee.username,
      password:employee.password,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      emergencyContactNo: employee.emergencyContactNo,
      role: employee.role,
      department: employee.department,
      designation: employee.designation,
      joiningDate: employee.joiningDate,
      dob: employee.dob,
      
    } : {
      department: '',
      role: '',
      joiningDate: '',
      dob: '',
    },
  });




  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-2">
          <Label htmlFor="username">User Name</Label>
          <Input
            id="username"
            {...register('username')}
            placeholder="e.g username"
            className="w-full"
          />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Password</Label>
          <Input
            id="password"
            {...register('password')}
            placeholder="Enter password"
            className="w-full"
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
        
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter full name"
            className="w-full"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="employee@company.com"
            className="w-full"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="+919999999999"
            className="w-full"
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContactNo">Emergency Phone Number</Label>
          <Input
            id="emergencyContactNo"
            {...register('emergencyContactNo')}
            placeholder="+919999999999"
            className="w-full"
          />
          {errors.emergencyContactNo && (
            <p className="text-sm text-red-600">{errors.emergencyContactNo.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue('designation', ''); 
                }}
              >
              <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.department && (
            <p className="text-sm text-red-600">{errors.department.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && (
            <p className="text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Input id="designation" {...register('designation')} placeholder="Enter designation" className="w-full" />
          {errors.designation && (
            <p className="text-sm text-red-600">{errors.designation.message}</p>
          )}
        </div>

        

        <div className="space-y-2">
          <Label htmlFor="joiningDate">Joining Date</Label>
          <Input
            id="joiningDate"
            type="date"
            {...register('joiningDate')}
            className="w-full"
          />
          {errors.joiningDate && (
            <p className="text-sm text-red-600">{errors.joiningDate.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            {...register('dob')}
            className="w-full"
          />
          {errors.dob && (
            <p className="text-sm text-red-600">{errors.dob.message}</p>
          )}
          
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          {employee ? 'Update Employee' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
}