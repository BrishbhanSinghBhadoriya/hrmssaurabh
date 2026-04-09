
"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { Edit, Save, Trash2, Plus, Target } from "lucide-react";

interface KRALimit {
  calls: number;
  talktime: number; // in minutes
  sales: number;
}

const KRATab = () => {
  const { user, updateUser } = useAuth();
  
  // Try to get existing KRA from user profile or use defaults
  const initialKRA: KRALimit = user?.kraLimits || {
    calls: 250,
    talktime: 150,
    sales: 1
  };

  const [isEditing, setIsEditing] = useState(false);
  const [tempKRA, setTempKRA] = useState<KRALimit>(initialKRA);
  const [isSaving, setIsSaving] = useState(false);

  const hasKRA = !!user?.kraLimits;

  const handleSave = async () => {
    if (tempKRA.calls < 0 || tempKRA.talktime < 0 || tempKRA.sales < 0) {
      toast.error("Please enter valid positive numbers");
      return;
    }

    setIsSaving(true);
    try {
      // API call to update user profile with KRA limits
      const response = await api.put("/users/profile/update", {
        kraLimits: tempKRA
      });

      if (response.data.success) {
        updateUser({ ...user, kraLimits: tempKRA } as any);
        setIsEditing(false);
        toast.success("KRA Goals updated successfully");
      } else {
        toast.error(response.data.message || "Failed to update KRA");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving KRA goals");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your KRA goals? This will reset them to defaults.")) return;
    
    setIsSaving(true);
    try {
      const response = await api.put("/users/profile/update", {
        kraLimits: null
      });

      if (response.data.success) {
        updateUser({ ...user, kraLimits: undefined } as any);
        setTempKRA({ calls: 250, talktime: 150, sales: 1 });
        setIsEditing(false);
        toast.success("KRA Goals deleted and reset");
      }
    } catch (err) {
      toast.error("Error deleting KRA goals");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My KRA Goals</CardTitle>
          <CardDescription>Set your daily performance targets</CardDescription>
        </div>
        {!isEditing && hasKRA && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing || !hasKRA ? (
          <div className="space-y-6">
            {!hasKRA && !isEditing && (
              <div className="bg-blue-50 p-4 rounded-lg text-blue-700 text-sm flex items-center gap-3">
                <Target className="h-5 w-5" />
                You haven't set your KRA goals yet. Click "Set Goals" to begin.
              </div>
            )}
            
            {(isEditing || !hasKRA) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="calls">Daily Calls Target</Label>
                  <Input
                    id="calls"
                    type="number"
                    value={tempKRA.calls}
                    onChange={(e) => setTempKRA({ ...tempKRA, calls: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 250"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="talktime">Talktime Target (Minutes)</Label>
                  <Input
                    id="talktime"
                    type="number"
                    value={tempKRA.talktime}
                    onChange={(e) => setTempKRA({ ...tempKRA, talktime: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 150"
                  />
                  <p className="text-[10px] text-muted-foreground">Equivalent to {formatTime(tempKRA.talktime)}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sales">Daily Sales Target</Label>
                  <Input
                    id="sales"
                    type="number"
                    value={tempKRA.sales}
                    onChange={(e) => setTempKRA({ ...tempKRA, sales: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 1"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              {isEditing && (
                <Button variant="ghost" onClick={() => { setIsEditing(false); setTempKRA(initialKRA); }}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : hasKRA ? "Save Changes" : "Set Goals"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border bg-background flex flex-col items-center justify-center text-center">
              <span className="text-sm text-muted-foreground uppercase font-semibold">Calls</span>
              <span className="text-3xl font-bold text-blue-600">{user?.kraLimits?.calls || 250}</span>
            </div>
            <div className="p-4 rounded-xl border bg-background flex flex-col items-center justify-center text-center">
              <span className="text-sm text-muted-foreground uppercase font-semibold">Talktime</span>
              <span className="text-3xl font-bold text-green-600">{formatTime(user?.kraLimits?.talktime || 150)}</span>
            </div>
            <div className="p-4 rounded-xl border bg-background flex flex-col items-center justify-center text-center">
              <span className="text-sm text-muted-foreground uppercase font-semibold">Sales</span>
              <span className="text-3xl font-bold text-purple-600">{user?.kraLimits?.sales || 1}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KRATab;
