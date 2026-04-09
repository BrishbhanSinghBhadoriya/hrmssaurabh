"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { authService } from "@/lib/auth";
import EmployeeSalaryDashboard from "@/components/salary/Employeesalarydashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SalarySlipPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = Cookies.get("token") || authService.getToken() || localStorage.getItem("token");
    setToken(t);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Salary Slip</CardTitle>
        </CardHeader>
        <CardContent>
          {token ? (
            <EmployeeSalaryDashboard token={token} />
          ) : (
            <div className="text-sm text-muted-foreground">
              Authentication token not found. Please re-login.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
