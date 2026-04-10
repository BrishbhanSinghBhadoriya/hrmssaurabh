 "use client";
 
 import React, { useState, useEffect } from "react";
 import { useAuth } from "@/lib/auth-context";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import SalarySlipManager from "@/components/Salaryslipmanager";
 import ManagerKRAPanel from "@/components/salary/Managerkrapanel";
 import Cookies from "js-cookie";
 import axios from "axios";
 import api from "@/lib/api";
 
 const NEXT_PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").replace(/\/+$/, '');
const API_URL = `${NEXT_PUBLIC_API_URL}/`;
 
 export default function SalaryManagerPage() {
   const { user } = useAuth();
   const role = user?.role;
   const [employees, setEmployees] = useState<any[]>([]);
   const [loading, setLoading] = useState(false);
 
   const allowed = role === "hr" || role === "manager" || role === "admin";
   const token = Cookies.get("token") || "";
 
   useEffect(() => {
     if (allowed) {
       fetchEmployees();
     }
   }, [allowed]);
 
   const fetchEmployees = async () => {
     try {
       setLoading(true);
       let res;
       try {
         res = await api.get("/api/hr/getEmployees");
       } catch (err) {
         res = await api.get("/hr/getEmployees");
       }
       
       const employeesData = res.data.employees || res.data.data;
       if (employeesData && Array.isArray(employeesData)) {
         setEmployees(employeesData);
       }
     } catch (err) {
       console.error("Error fetching employees in page:", err);
     } finally {
       setLoading(false);
     }
   };
 
   return (
     <div className="space-y-6">
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Left Side: Salary Manager */}
         <div className="lg:col-span-8">
           <Card className="rounded-2xl h-full">
             <CardHeader>
               <CardTitle>Salary Manager</CardTitle>
             </CardHeader>
             <CardContent>
               {allowed ? (
                 <SalarySlipManager />
               ) : (
                 <div className="text-sm text-muted-foreground">
                   Not all users have access to this feature.
                 </div>
               )}
             </CardContent>
           </Card>
         </div>
 
         {/* Right Side: KRA Panel */}
         <div className="lg:col-span-4">
           {allowed && (
             <ManagerKRAPanel token={token} employees={employees} />
           )}
         </div>
       </div>
     </div>
   );
 }
